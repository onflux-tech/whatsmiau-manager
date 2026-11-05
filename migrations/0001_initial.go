package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// 0001_initial creates the base collections.
//
// The numeric prefix is what orders the migrations: PocketBase sorts the
// registered migrations by file name, so an unprefixed "initial.go" used to run
// after "add_*" and a fresh install failed before the collections existed.
//
// Every helper below looks the collection up before creating it, so the
// migration can run again (PocketBase keys applied migrations by file name, and
// renaming a file makes it "new" for databases that already have the old name
// recorded) without trying to create a collection that is already there.
func init() {
	m.Register(func(app core.App) error {
		workspaces, err := ensureWorkspaces(app)
		if err != nil {
			return err
		}

		if err := ensureHealthChecks(app, workspaces.Id); err != nil {
			return err
		}

		return ensureInstanceSnapshots(app, workspaces.Id)
	}, nil)
}

func ensureWorkspaces(app core.App) (*core.Collection, error) {
	if col, err := app.FindCollectionByNameOrId("workspaces"); err == nil {
		return col, nil
	}

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
		return nil, err
	}

	return workspaces, nil
}

func ensureHealthChecks(app core.App, workspaceCollectionID string) error {
	if _, err := app.FindCollectionByNameOrId("health_checks"); err == nil {
		return nil
	}

	healthChecks := core.NewBaseCollection("health_checks")

	healthChecks.Fields.Add(
		&core.RelationField{
			Name:          "workspace",
			Required:      true,
			CollectionId:  workspaceCollectionID,
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

	return app.Save(healthChecks)
}

func ensureInstanceSnapshots(app core.App, workspaceCollectionID string) error {
	if _, err := app.FindCollectionByNameOrId("instance_snapshots"); err == nil {
		return nil
	}

	snapshots := core.NewBaseCollection("instance_snapshots")

	snapshots.Fields.Add(
		&core.RelationField{
			Name:          "workspace",
			Required:      true,
			CollectionId:  workspaceCollectionID,
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
}

func toPtr[T any](v T) *T {
	return &v
}
