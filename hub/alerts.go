package hub

import (
	"log"
	"net/http"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

const alertsLimit = 50

func (h *Hub) createAlert(workspaceID, snapshotID, instanceName, kind string) {
	existing, _ := h.App.FindFirstRecordByFilter(
		"alerts",
		"workspace = {:wid} && instance_snapshot = {:sid} && kind = {:kind} && read = false",
		map[string]any{"wid": workspaceID, "sid": snapshotID, "kind": kind},
	)
	if existing != nil {
		return
	}

	col, err := h.App.FindCollectionByNameOrId("alerts")
	if err != nil {
		log.Printf("[alerts] collection not found: %v", err)
		return
	}

	record := core.NewRecord(col)
	record.Set("workspace", workspaceID)
	record.Set("instance_snapshot", snapshotID)
	record.Set("instance_name", instanceName)
	record.Set("kind", kind)
	record.Set("read", false)

	if err := h.App.Save(record); err != nil {
		log.Printf("[alerts] failed to save alert for instance %s: %v", instanceName, err)
	}
}

func (h *Hub) registerAlertRoutes(e *core.ServeEvent) {
	// GET /api/alerts?workspace=<wid>&unread=true
	e.Router.GET("/api/alerts", func(re *core.RequestEvent) error {
		if re.Auth == nil {
			return re.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
		}

		wid := re.Request.URL.Query().Get("workspace")
		onlyUnread := re.Request.URL.Query().Get("unread") == "true"

		filter := "1=1"
		params := dbx.Params{}

		if wid != "" {
			filter += " && workspace = {:wid}"
			params["wid"] = wid
		}
		if onlyUnread {
			filter += " && read = false"
		}

		records, err := h.App.FindRecordsByFilter("alerts", filter, "-created", alertsLimit, 0, params)
		if err != nil {
			return re.JSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
		}

		type alertDTO struct {
			ID           string `json:"id"`
			Workspace    string `json:"workspace"`
			SnapshotID   string `json:"instance_snapshot"`
			InstanceName string `json:"instance_name"`
			Kind         string `json:"kind"`
			Read         bool   `json:"read"`
			Created      string `json:"created"`
		}

		out := make([]alertDTO, 0, len(records))
		for _, r := range records {
			out = append(out, alertDTO{
				ID:           r.Id,
				Workspace:    r.GetString("workspace"),
				SnapshotID:   r.GetString("instance_snapshot"),
				InstanceName: r.GetString("instance_name"),
				Kind:         r.GetString("kind"),
				Read:         r.GetBool("read"),
				Created:      r.GetDateTime("created").String(),
			})
		}

		return re.JSON(http.StatusOK, out)
	})

	// PATCH /api/alerts/read-all — must be registered BEFORE /{id}/read
	e.Router.PATCH("/api/alerts/read-all", func(re *core.RequestEvent) error {
		if re.Auth == nil {
			return re.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
		}

		wid := re.Request.URL.Query().Get("workspace")

		filter := "read = false"
		params := dbx.Params{}
		if wid != "" {
			filter += " && workspace = {:wid}"
			params["wid"] = wid
		}

		records, err := h.App.FindRecordsByFilter("alerts", filter, "-created", 200, 0, params)
		if err != nil {
			return re.JSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
		}

		for _, r := range records {
			r.Set("read", true)
			if err := h.App.Save(r); err != nil {
				log.Printf("[alerts] failed to mark alert %s as read: %v", r.Id, err)
			}
		}

		return re.JSON(http.StatusOK, map[string]int{"marked": len(records)})
	})

	// DELETE /api/alerts — delete read alerts (or all if force=true)
	e.Router.DELETE("/api/alerts", func(re *core.RequestEvent) error {
		if re.Auth == nil {
			return re.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
		}

		wid := re.Request.URL.Query().Get("workspace")

		filter := "read = true"
		params := dbx.Params{}
		if wid != "" {
			filter += " && workspace = {:wid}"
			params["wid"] = wid
		}

		records, err := h.App.FindRecordsByFilter("alerts", filter, "-created", 200, 0, params)
		if err != nil {
			return re.JSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
		}

		for _, r := range records {
			if err := h.App.Delete(r); err != nil {
				log.Printf("[alerts] failed to delete alert %s: %v", r.Id, err)
			}
		}

		return re.JSON(http.StatusOK, map[string]int{"deleted": len(records)})
	})

	// PATCH /api/alerts/{id}/read
	e.Router.PATCH("/api/alerts/{id}/read", func(re *core.RequestEvent) error {
		if re.Auth == nil {
			return re.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
		}

		id := re.Request.PathValue("id")
		record, err := h.App.FindRecordById("alerts", id)
		if err != nil {
			return re.JSON(http.StatusNotFound, map[string]string{"message": "Alert not found"})
		}

		record.Set("read", true)
		if err := h.App.Save(record); err != nil {
			return re.JSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
		}

		return re.JSON(http.StatusOK, map[string]string{"message": "ok"})
	})
}
