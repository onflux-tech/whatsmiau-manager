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

		if workspaces.Fields.GetByName("icon_color") == nil {
			workspaces.Fields.Add(&core.TextField{Name: "icon_color", Max: 7})
		}

		if workspaces.Fields.GetByName("icon_file") == nil {
			workspaces.Fields.Add(&core.FileField{
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
			})
		}

		return app.Save(workspaces)
	}, nil)
}
