package migrations

import (
	"log"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// 0003_add_workspace_icon_order adds the icon and manual ordering columns to
// databases created before the workspace reorder feature.
func init() {
	m.Register(func(app core.App) error {
		workspaces, err := app.FindCollectionByNameOrId("workspaces")
		if err != nil {
			// Safety net: the base collection is created by 0001_initial.
			log.Printf("[migrations] 0003_add_workspace_icon_order: no workspaces collection, skipping")
			return nil
		}

		if workspaces.Fields.GetByName("icon") == nil {
			workspaces.Fields.Add(&core.TextField{Name: "icon", Max: 50})
		}
		if workspaces.Fields.GetByName("order") == nil {
			workspaces.Fields.Add(&core.NumberField{Name: "order", Min: toPtr(0.0)})
		}

		return app.Save(workspaces)
	}, nil)
}
