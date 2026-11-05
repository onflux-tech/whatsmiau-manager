package migrations

import (
	"log"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// 0002_add_workspace_icon_fields adds the icon columns to databases created
// before the icon picker existed (0.1.0).
func init() {
	m.Register(func(app core.App) error {
		workspaces, err := app.FindCollectionByNameOrId("workspaces")
		if err != nil {
			// Safety net: the base collection is created by 0001_initial. If it
			// is missing the ordering is broken, and aborting the boot helps
			// nobody - there is simply nothing to patch.
			log.Printf("[migrations] 0002_add_workspace_icon_fields: no workspaces collection, skipping")
			return nil
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
