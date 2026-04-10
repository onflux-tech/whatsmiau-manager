package hub

import (
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/pocketbase/pocketbase/core"
)

var (
	proxyClient  = &http.Client{Timeout: 30 * time.Second}
	healthClient = &http.Client{Timeout: 10 * time.Second}
)

func (h *Hub) proxyTo(pathFn func(re *core.RequestEvent) string) func(re *core.RequestEvent) error {
	return func(re *core.RequestEvent) error {
		info, _ := re.RequestInfo()
		if info.Auth == nil {
			return re.UnauthorizedError("Authentication required", nil)
		}

		wid := re.Request.PathValue("wid")
		ws, err := h.App.FindRecordById("workspaces", wid)
		if err != nil {
			return re.NotFoundError("Workspace not found", nil)
		}

		baseURL := strings.TrimRight(ws.GetString("url"), "/")
		apiKey := ws.GetString("api_key")

		u, err := url.Parse(baseURL)
		if err != nil || (u.Scheme != "http" && u.Scheme != "https") {
			return re.Error(http.StatusBadRequest, "Invalid workspace URL", nil)
		}

		targetURL := baseURL + "/v1" + pathFn(re)
		if re.Request.URL.RawQuery != "" {
			targetURL += "?" + re.Request.URL.RawQuery
		}

		req, err := http.NewRequestWithContext(
			re.Request.Context(),
			re.Request.Method,
			targetURL,
			re.Request.Body,
		)
		if err != nil {
			return re.InternalServerError("Failed to build proxy request", nil)
		}

		req.Header.Set("apikey", apiKey)
		if ct := re.Request.Header.Get("Content-Type"); ct != "" {
			req.Header.Set("Content-Type", ct)
		}

		resp, err := proxyClient.Do(req)
		if err != nil {
			return re.Error(http.StatusBadGateway, "WhatsMiau API unreachable", map[string]any{
				"error":   "bad_gateway",
				"message": "Could not reach the WhatsMiau API",
			})
		}
		defer resp.Body.Close()

		if resp.StatusCode == http.StatusUnauthorized {
			return re.Error(http.StatusServiceUnavailable, "Invalid API key", map[string]any{
				"error":   "auth_error",
				"message": "API key rejected by WhatsMiau API",
			})
		}

		for _, name := range []string{"Content-Type", "Content-Length"} {
			if v := resp.Header.Get(name); v != "" {
				re.Response.Header().Set(name, v)
			}
		}

		re.Response.WriteHeader(resp.StatusCode)
		io.Copy(re.Response, resp.Body)

		return nil
	}
}
