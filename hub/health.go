package hub

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

const maxConcurrentStatusChecks = 5

func (h *Hub) registerCrons() {
	h.App.Cron().Add("health_check", "*/1 * * * *", func() {
		h.runHealthChecks()
	})

	h.App.Cron().Add("instance_snapshot", "*/5 * * * *", func() {
		h.runInstanceSnapshots()
	})

	h.App.Cron().Add("cleanup_old_records", "0 * * * *", func() {
		h.cleanupOldRecords()
	})
}

func (h *Hub) runHealthChecks() {
	records, err := h.App.FindAllRecords("workspaces")
	if err != nil {
		log.Printf("[health] failed to list workspaces: %v", err)
		return
	}
	for _, ws := range records {
		h.checkWorkspaceHealth(ws)
	}
}

func (h *Hub) checkWorkspaceHealth(ws *core.Record) {
	baseURL := strings.TrimRight(ws.GetString("url"), "/")
	apiKey := ws.GetString("api_key")

	status := "up"
	var latencyMs int64
	var instancesTotal, instancesConnected int

	start := time.Now()
	instances := h.fetchInstances(baseURL, apiKey)
	latencyMs = time.Since(start).Milliseconds()

	if instances == nil {
		status = "down"
	} else {
		instancesTotal = len(instances)
		for _, inst := range instances {
			resp, err := h.apiGet(baseURL+"/v1/instance/"+inst.ID+"/status", apiKey)
			if err == nil {
				var sr instanceStatusResponse
				if b, err := io.ReadAll(resp.Body); err == nil {
					if json.Unmarshal(b, &sr) == nil && sr.State == "open" {
						instancesConnected++
					}
				}
				resp.Body.Close()
			}
		}
	}

	col, err := h.App.FindCollectionByNameOrId("health_checks")
	if err != nil {
		log.Printf("[health] collection not found: %v", err)
		return
	}

	record := core.NewRecord(col)
	record.Set("workspace", ws.Id)
	record.Set("latency_ms", latencyMs)
	record.Set("status", status)
	record.Set("instances_total", instancesTotal)
	record.Set("instances_connected", instancesConnected)

	if err := h.App.Save(record); err != nil {
		log.Printf("[health] failed to save: %v", err)
	}
}

type instanceListItem struct {
	ID           string `json:"id"`
	InstanceName string `json:"instanceName"`
	OwnerJID     string `json:"ownerJid"`
}

type instanceStatusResponse struct {
	State string `json:"state"`
}

func (h *Hub) runInstanceSnapshots() {
	records, err := h.App.FindAllRecords("workspaces")
	if err != nil {
		log.Printf("[snapshot] failed to list workspaces: %v", err)
		return
	}
	for _, ws := range records {
		h.pollWorkspaceInstances(ws)
	}
}

func (h *Hub) pollWorkspaceInstances(ws *core.Record) {
	baseURL := strings.TrimRight(ws.GetString("url"), "/")
	apiKey := ws.GetString("api_key")

	instances := h.fetchInstances(baseURL, apiKey)
	if instances == nil {
		return
	}

	col, err := h.App.FindCollectionByNameOrId("instance_snapshots")
	if err != nil {
		log.Printf("[snapshot] collection not found: %v", err)
		return
	}

	type instanceResult struct {
		inst   instanceListItem
		status string
	}

	results := make([]instanceResult, len(instances))
	sem := make(chan struct{}, maxConcurrentStatusChecks)
	var wg sync.WaitGroup

	for i, inst := range instances {
		wg.Add(1)
		go func(idx int, inst instanceListItem) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			status := "closed"
			statusResp, err := h.apiGet(baseURL+"/v1/instance/"+inst.ID+"/status", apiKey)
			if err == nil {
				var sr instanceStatusResponse
				if b, err := io.ReadAll(statusResp.Body); err == nil {
					if json.Unmarshal(b, &sr) == nil && sr.State != "" {
						status = sr.State
					}
				}
				statusResp.Body.Close()
			}

			results[idx] = instanceResult{inst: inst, status: status}
		}(i, inst)
	}
	wg.Wait()

	activeIDs := make(map[string]bool, len(instances))
	for _, r := range results {
		activeIDs[r.inst.ID] = true

		phone := ""
		if r.inst.OwnerJID != "" {
			phone = strings.SplitN(r.inst.OwnerJID, "@", 2)[0]
		}

		existing, _ := h.App.FindFirstRecordByFilter(
			"instance_snapshots",
			"workspace = {:wid} && instance_id = {:iid}",
			map[string]any{"wid": ws.Id, "iid": r.inst.ID},
		)

		var record *core.Record
		if existing != nil {
			record = existing
		} else {
			record = core.NewRecord(col)
			record.Set("workspace", ws.Id)
			record.Set("instance_id", r.inst.ID)
		}

		newStatus := normalizeStatus(r.status)
		oldStatus := ""
		if existing != nil {
			oldStatus = existing.GetString("status")
		}

		record.Set("name", r.inst.InstanceName)
		record.Set("status", newStatus)
		record.Set("phone", phone)

		if err := h.App.Save(record); err != nil {
			log.Printf("[snapshot] failed to save instance %s: %v", r.inst.ID, err)
			continue
		}

		if oldStatus == "open" && newStatus == "closed" {
			go h.createAlert(ws.Id, record.Id, r.inst.InstanceName, "disconnected")
		}
		if (oldStatus == "closed" || oldStatus == "qr-code" || oldStatus == "connecting") && newStatus == "open" {
			go h.createAlert(ws.Id, record.Id, r.inst.InstanceName, "reconnected")
		}
		if (oldStatus == "open" || oldStatus == "closed") && newStatus == "qr-code" {
			go h.createAlert(ws.Id, record.Id, r.inst.InstanceName, "qr_pending")
		}
	}

	existing, _ := h.App.FindAllRecords("instance_snapshots",
		dbx.NewExp("workspace = {:wid}", dbx.Params{"wid": ws.Id}),
	)
	for _, r := range existing {
		if !activeIDs[r.GetString("instance_id")] {
			if err := h.App.Delete(r); err != nil {
				log.Printf("[snapshot] failed to delete stale instance %s: %v", r.GetString("instance_id"), err)
			}
		}
	}
}

func (h *Hub) fetchInstances(baseURL, apiKey string) []instanceListItem {
	resp, err := h.apiGet(baseURL+"/v1/instance", apiKey)
	if err != nil {
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil
	}

	var items []instanceListItem
	if err := json.Unmarshal(body, &items); err != nil {
		return nil
	}
	return items
}

func (h *Hub) apiGet(url, apiKey string) (*http.Response, error) {
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("apikey", apiKey)
	return healthClient.Do(req)
}

func (h *Hub) cleanupOldRecords() {
	cutoff := time.Now().AddDate(0, 0, -7).UTC().Format("2006-01-02 15:04:05")

	records, err := h.App.FindAllRecords("health_checks",
		dbx.NewExp("created < {:cutoff}", dbx.Params{"cutoff": cutoff}),
	)
	if err != nil {
		return
	}
	for _, r := range records {
		if err := h.App.Delete(r); err != nil {
			log.Printf("[cleanup] failed to delete health_checks/%s: %v", r.Id, err)
		}
	}
}

func normalizeStatus(status string) string {
	switch status {
	case "open", "connecting", "qr-code", "closed":
		return status
	default:
		return "closed"
	}
}
