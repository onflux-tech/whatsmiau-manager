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

		if workspaces.Fields.GetByName("icon") == nil {
			workspaces.Fields.Add(&core.TextField{Name: "icon", Max: 50})
		}
		if workspaces.Fields.GetByName("order") == nil {
			workspaces.Fields.Add(&core.NumberField{Name: "order", Min: toPtr(0.0)})
		}

		return app.Save(workspaces)
	}, nil)
}
