package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		workspaces, err := app.FindCollectionByNameOrId("workspaces")
		if err != nil {
			return err
		}

		snapshots, err := app.FindCollectionByNameOrId("instance_snapshots")
		if err != nil {
			return err
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
			return err
		}
		return app.Delete(col)
	})
}
