//go:build !dev

package hub

import (
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/whatsmiau/manager/site"
)

func (h *Hub) registerSPA(e *core.ServeEvent) {
	e.Router.GET("/{path...}", apis.Static(site.DistDirFS, true))
}
