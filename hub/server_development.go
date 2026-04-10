//go:build dev

package hub

import (
	"net/http/httputil"
	"net/url"

	"github.com/pocketbase/pocketbase/core"
)

func (h *Hub) registerSPA(e *core.ServeEvent) {
	target, _ := url.Parse("http://localhost:5173")
	proxy := httputil.NewSingleHostReverseProxy(target)

	e.Router.GET("/{path...}", func(re *core.RequestEvent) error {
		proxy.ServeHTTP(re.Response, re.Request)
		return nil
	})
}
