.PHONY: dev build build-web-ui clean lint

# Development with hot reload (Air + Vite)
dev:
	air &
	@echo "Waiting for backend..."
	@until curl -sf http://localhost:8090/api/health > /dev/null 2>&1; do sleep 1; done
	@echo "Backend ready, starting Vite..."
	cd site && npm run dev

# Build the SPA
build-web-ui:
	cd site && npm install && npm run build

# Build the Go binary (includes embedded SPA)
build: build-web-ui
	CGO_ENABLED=0 go build -o build/manager.exe main.go

# Clean build artifacts
clean:
	rm -rf build/ tmp/ site/dist/ site/node_modules/

# Lint & format
lint:
	cd site && npm run lint
	gofmt -l hub/ migrations/ .
	go vet -tags dev ./...
