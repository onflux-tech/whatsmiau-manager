package hub

import (
	"log"
	"sync"

	"github.com/pocketbase/pocketbase/core"
)

type Hub struct {
	core.App
	version string
	poller  *Poller
	setupMu sync.Mutex
}

func NewHub(app core.App, version string) *Hub {
	h := &Hub{App: app, version: version}
	h.poller = newPoller(h)
	return h
}

func (h *Hub) Start() {
	h.App.OnServe().BindFunc(func(e *core.ServeEvent) error {
		h.registerRoutes(e)
		h.registerSPA(e)

		h.poller.Start()

		return e.Next()
	})

	h.App.OnRecordEnrich("workspaces").BindFunc(func(e *core.RecordEnrichEvent) error {
		e.Record.Set("api_key", "")
		return e.Next()
	})

	h.App.OnRecordAfterCreateSuccess("workspaces").BindFunc(func(e *core.RecordEvent) error {
		go h.onWorkspaceChanged(e.Record.Id)
		return e.Next()
	})
	h.App.OnRecordAfterUpdateSuccess("workspaces").BindFunc(func(e *core.RecordEvent) error {
		go h.onWorkspaceChanged(e.Record.Id)
		return e.Next()
	})
	h.App.OnRecordAfterDeleteSuccess("workspaces").BindFunc(func(e *core.RecordEvent) error {
		h.poller.Stop(e.Record.Id)
		return e.Next()
	})

	h.App.OnTerminate().BindFunc(func(e *core.TerminateEvent) error {
		h.poller.StopAll()
		return e.Next()
	})

	h.registerCrons()
}

func (h *Hub) onWorkspaceChanged(wid string) {
	ws, err := h.App.FindRecordById("workspaces", wid)
	if err != nil {
		log.Printf("[hub] failed to reload workspace %s: %v", wid, err)
		return
	}
	h.pollWorkspaceInstances(ws)
}
