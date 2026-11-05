package migrations

import (
	"log"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// 0004_add_alerts_collection creates the alerts collection. It runs last, after
// 0001_initial created the collections its relations point to.
func init() {
	m.Register(func(app core.App) error {
		if _, err := app.FindCollectionByNameOrId("alerts"); err == nil {
			// Already created by a database that ran the migration under its
			// original file name ("add_alerts_collection.go").
			return nil
		}

		workspaces, err := app.FindCollectionByNameOrId("workspaces")
		if err != nil {
			// Safety net: the base collections are created by 0001_initial.
			log.Printf("[migrations] 0004_add_alerts_collection: no workspaces collection, skipping")
			return nil
		}

		snapshots, err := app.FindCollectionByNameOrId("instance_snapshots")
		if err != nil {
			log.Printf("[migrations] 0004_add_alerts_collection: no instance_snapshots collection, skipping")
			return nil
		}

		alerts := core.NewBaseCollection("alerts")

		alerts.Fields.Add(
			&core.RelationField{
				Name:          "workspace",
				Required:      true,
				CollectionId:  workspaces.Id,
				CascadeDelete: true,
				MaxSelect:     1,
			},
			&core.RelationField{
				Name:          "instance_snapshot",
				Required:      true,
				CollectionId:  snapshots.Id,
				CascadeDelete: true,
				MaxSelect:     1,
			},
			&core.TextField{Name: "instance_name"},
			&core.SelectField{
				Name:      "kind",
				Required:  true,
				Values:    []string{"disconnected", "reconnected", "qr_pending"},
				MaxSelect: 1,
			},
			&core.BoolField{Name: "read"},
			&core.AutodateField{Name: "created", OnCreate: true},
			&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
		)

		alerts.AddIndex("idx_alerts_workspace", false, "workspace", "")
		alerts.AddIndex("idx_alerts_read", false, "read", "")

		alerts.ListRule = toPtr("@request.auth.id != ''")
		alerts.ViewRule = toPtr("@request.auth.id != ''")
		alerts.UpdateRule = toPtr("@request.auth.id != ''")
		alerts.DeleteRule = toPtr("@request.auth.id != ''")

		return app.Save(alerts)
	}, func(app core.App) error {
		col, err := app.FindCollectionByNameOrId("alerts")
		if err != nil {
			return nil
		}
		return app.Delete(col)
	})
}
