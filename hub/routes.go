package hub

import (
	"net/http"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func (h *Hub) registerRoutes(e *core.ServeEvent) {
	e.Router.BindFunc(func(re *core.RequestEvent) error {
		re.Response.Header().Set("X-Content-Type-Options", "nosniff")
		re.Response.Header().Set("X-Frame-Options", "DENY")
		re.Response.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		re.Response.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		return re.Next()
	})

	// Version
	e.Router.GET("/api/version", func(re *core.RequestEvent) error {
		return re.JSON(200, map[string]string{"version": h.version})
	})

	// Setup check
	e.Router.GET("/api/setup/status", func(re *core.RequestEvent) error {
		total, err := h.App.CountRecords("_superusers",
			dbx.NewExp("email != {:email}", dbx.Params{"email": core.DefaultInstallerEmail}),
		)
		if err != nil {
			return re.JSON(200, map[string]bool{"needsSetup": true})
		}
		return re.JSON(200, map[string]bool{"needsSetup": total == 0})
	})

	// Create first superuser
	e.Router.POST("/api/setup", func(re *core.RequestEvent) error {
		h.setupMu.Lock()
		defer h.setupMu.Unlock()

		total, _ := h.App.CountRecords("_superusers",
			dbx.NewExp("email != {:email}", dbx.Params{"email": core.DefaultInstallerEmail}),
		)
		if total > 0 {
			return re.JSON(403, map[string]string{"message": "Setup already completed"})
		}

		data := struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}{}
		if err := re.BindBody(&data); err != nil {
			return re.JSON(400, map[string]string{"message": "Invalid request body"})
		}

		data.Email = strings.TrimSpace(data.Email)
		if data.Email == "" || data.Password == "" {
			return re.JSON(400, map[string]string{"message": "Email and password are required"})
		}
		if len(data.Password) < 8 {
			return re.JSON(400, map[string]string{"message": "Password must be at least 8 characters"})
		}

		collection, err := h.App.FindCollectionByNameOrId(core.CollectionNameSuperusers)
		if err != nil {
			return re.JSON(500, map[string]string{"message": "Internal server error"})
		}

		record := core.NewRecord(collection)
		record.SetEmail(data.Email)
		record.SetPassword(data.Password)
		if err := h.App.Save(record); err != nil {
			return re.JSON(400, map[string]string{"message": "Failed to create account. Check email format and password strength."})
		}

		return re.JSON(200, map[string]string{"message": "ok"})
	})

	e.Router.GET("/api/workspace/{wid}/settings", func(re *core.RequestEvent) error {
		info, _ := re.RequestInfo()
		if info.Auth == nil {
			return re.UnauthorizedError("Authentication required", nil)
		}

		wid := re.Request.PathValue("wid")
		ws, err := h.App.FindRecordById("workspaces", wid)
		if err != nil {
			return re.NotFoundError("Workspace not found", nil)
		}

		return re.JSON(http.StatusOK, map[string]any{
			"id":      ws.Id,
			"name":    ws.GetString("name"),
			"url":     ws.GetString("url"),
			"api_key": ws.GetString("api_key"),
		})
	})

	// Sync instance
	e.Router.POST("/api/proxy/{wid}/sync", func(re *core.RequestEvent) error {
		if re.Auth == nil {
			return re.JSON(401, map[string]string{"message": "Unauthorized"})
		}
		wid := re.Request.PathValue("wid")
		ws, err := h.App.FindRecordById("workspaces", wid)
		if err != nil {
			return re.JSON(404, map[string]string{"message": "Workspace not found"})
		}
		h.pollWorkspaceInstances(ws)
		return re.JSON(200, map[string]string{"message": "ok"})
	})

	// Polling heartbeat
	e.Router.POST("/api/polling/heartbeat", func(re *core.RequestEvent) error {
		if re.Auth == nil {
			return re.JSON(401, map[string]string{"message": "Unauthorized"})
		}
		data := struct {
			Workspace string `json:"workspace"`
			Tier      string `json:"tier"`
		}{}
		if err := re.BindBody(&data); err != nil || data.Workspace == "" {
			return re.JSON(400, map[string]string{"message": "Invalid body"})
		}
		if _, err := h.App.FindRecordById("workspaces", data.Workspace); err != nil {
			return re.JSON(404, map[string]string{"message": "Workspace not found"})
		}
		h.poller.Heartbeat(data.Workspace, pollingTier(data.Tier))
		return re.JSON(200, map[string]string{"message": "ok"})
	})

	proxy := e.Router.Group("/api/proxy")

	// Instance list
	proxy.GET("/{wid}/instance", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance"
	}))

	// Instance create
	proxy.POST("/{wid}/instance", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance"
	}))

	// Instance delete
	proxy.DELETE("/{wid}/instance/{iid}", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance/" + re.Request.PathValue("iid")
	}))

	// Instance status
	proxy.GET("/{wid}/instance/{iid}/status", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance/" + re.Request.PathValue("iid") + "/status"
	}))

	// Instance connect
	proxy.POST("/{wid}/instance/{iid}/connect", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance/" + re.Request.PathValue("iid") + "/connect"
	}))

	// Instance QR image
	proxy.GET("/{wid}/instance/{iid}/qr", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance/connect/" + re.Request.PathValue("iid") + "/image"
	}))

	// Instance logout
	proxy.POST("/{wid}/instance/{iid}/logout", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance/" + re.Request.PathValue("iid") + "/logout"
	}))

	// Instance update (proxy/webhook settings)
	proxy.PUT("/{wid}/instance/{iid}", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance/update/" + re.Request.PathValue("iid")
	}))

	// Webhook find
	proxy.GET("/{wid}/webhook/{iid}", h.proxyTo(func(re *core.RequestEvent) string {
		return "/webhook/find/" + re.Request.PathValue("iid")
	}))

	// Webhook set
	proxy.POST("/{wid}/webhook/{iid}", h.proxyTo(func(re *core.RequestEvent) string {
		return "/webhook/set/" + re.Request.PathValue("iid")
	}))

	// Message: send text
	proxy.POST("/{wid}/instance/{iid}/message/text", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance/" + re.Request.PathValue("iid") + "/message/text"
	}))

	// Message: send image
	proxy.POST("/{wid}/instance/{iid}/message/image", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance/" + re.Request.PathValue("iid") + "/message/image"
	}))

	// Message: send audio
	proxy.POST("/{wid}/instance/{iid}/message/audio", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance/" + re.Request.PathValue("iid") + "/message/audio"
	}))

	// Message: send document
	proxy.POST("/{wid}/instance/{iid}/message/document", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance/" + re.Request.PathValue("iid") + "/message/document"
	}))

	// Message: send list
	proxy.POST("/{wid}/instance/{iid}/message/list", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance/" + re.Request.PathValue("iid") + "/message/list"
	}))

	// Message: send buttons
	proxy.POST("/{wid}/instance/{iid}/message/buttons", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance/" + re.Request.PathValue("iid") + "/message/buttons"
	}))

	// Chat: send presence
	proxy.POST("/{wid}/instance/{iid}/chat/presence", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance/" + re.Request.PathValue("iid") + "/chat/presence"
	}))

	// Chat: mark messages as read
	proxy.POST("/{wid}/instance/{iid}/chat/read-messages", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance/" + re.Request.PathValue("iid") + "/chat/read-messages"
	}))

	// Chat: delete message for everyone
	proxy.DELETE("/{wid}/instance/{iid}/chat/delete-message", h.proxyTo(func(re *core.RequestEvent) string {
		return "/instance/" + re.Request.PathValue("iid") + "/chat/deleteMessageForEveryone"
	}))

	// Chat: check WhatsApp numbers
	proxy.POST("/{wid}/instance/{iid}/chat/check-number", h.proxyTo(func(re *core.RequestEvent) string {
		return "/chat/whatsappNumbers/" + re.Request.PathValue("iid")
	}))

	// Message: send reaction
	proxy.POST("/{wid}/instance/{iid}/message/reaction", h.proxyTo(func(re *core.RequestEvent) string {
		return "/message/sendReaction/" + re.Request.PathValue("iid")
	}))

	// Message: send media (generic)
	proxy.POST("/{wid}/instance/{iid}/message/media", h.proxyTo(func(re *core.RequestEvent) string {
		return "/message/sendMedia/" + re.Request.PathValue("iid")
	}))
}
