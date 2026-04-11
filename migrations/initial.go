package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		workspaces := core.NewBaseCollection("workspaces")

		workspaces.Fields.Add(
			&core.TextField{Name: "name", Required: true, Max: 100},
			&core.URLField{Name: "url", Required: true},
			&core.TextField{Name: "api_key", Required: true},
			&core.TextField{Name: "icon", Max: 50},
			&core.TextField{Name: "icon_color", Max: 7},
			&core.FileField{
				Name:      "icon_file",
				MaxSelect: 1,
				MaxSize:   512 * 1024,
				MimeTypes: []string{
					"image/png",
					"image/jpeg",
					"image/webp",
					"image/gif",
					"image/svg+xml",
				},
			},
			&core.NumberField{Name: "order", Min: toPtr(0.0)},
			&core.AutodateField{Name: "created", OnCreate: true},
			&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
		)
		workspaces.AddIndex("idx_workspaces_url", true, "url", "")

		workspaces.ListRule = toPtr("@request.auth.id != ''")
		workspaces.ViewRule = toPtr("@request.auth.id != ''")
		workspaces.CreateRule = toPtr("@request.auth.id != ''")
		workspaces.UpdateRule = toPtr("@request.auth.id != ''")
		workspaces.DeleteRule = toPtr("@request.auth.id != ''")

		if err := app.Save(workspaces); err != nil {
			return err
		}

		healthChecks := core.NewBaseCollection("health_checks")

		healthChecks.Fields.Add(
			&core.RelationField{
				Name:          "workspace",
				Required:      true,
				CollectionId:  workspaces.Id,
				CascadeDelete: true,
				MaxSelect:     1,
			},
			&core.NumberField{Name: "latency_ms", Min: toPtr(0.0)},
			&core.SelectField{
				Name:      "status",
				Required:  true,
				Values:    []string{"up", "down", "auth_error"},
				MaxSelect: 1,
			},
			&core.NumberField{Name: "instances_total", Min: toPtr(0.0)},
			&core.NumberField{Name: "instances_connected", Min: toPtr(0.0)},
			&core.AutodateField{Name: "created", OnCreate: true},
			&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
		)
		healthChecks.AddIndex("idx_health_checks_workspace", false, "workspace", "")

		healthChecks.ListRule = toPtr("@request.auth.id != ''")
		healthChecks.ViewRule = toPtr("@request.auth.id != ''")

		if err := app.Save(healthChecks); err != nil {
			return err
		}

		snapshots := core.NewBaseCollection("instance_snapshots")

		snapshots.Fields.Add(
			&core.RelationField{
				Name:          "workspace",
				Required:      true,
				CollectionId:  workspaces.Id,
				CascadeDelete: true,
				MaxSelect:     1,
			},
			&core.TextField{Name: "instance_id", Required: true},
			&core.TextField{Name: "name"},
			&core.SelectField{
				Name:      "status",
				Values:    []string{"open", "connecting", "qr-code", "closed"},
				MaxSelect: 1,
			},
			&core.TextField{Name: "phone"},
			&core.AutodateField{Name: "created", OnCreate: true},
			&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
		)
		snapshots.AddIndex("idx_instance_snapshots_workspace", false, "workspace", "")
		snapshots.AddIndex("idx_instance_snapshots_wid", true, "workspace, instance_id", "")

		snapshots.ListRule = toPtr("@request.auth.id != ''")
		snapshots.ViewRule = toPtr("@request.auth.id != ''")

		return app.Save(snapshots)
	}, nil)
}

func toPtr[T any](v T) *T {
	return &v
}
