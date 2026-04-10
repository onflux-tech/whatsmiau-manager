# WhatsMiau Manager

[![Go](https://img.shields.io/badge/Go-1.25-00ADD8?logo=go&logoColor=white)](https://go.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![PocketBase](https://img.shields.io/badge/PocketBase-0.36-B8DBE4?logo=pocketbase&logoColor=white)](https://pocketbase.io)
[![Docker](https://img.shields.io/badge/Docker-Multi--arch-2496ED?logo=docker&logoColor=white)](https://github.com/onflux-tech/whatsmiau-manager/pkgs/container/whatsmiau-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![GHCR](https://img.shields.io/badge/GHCR-Package-purple?logo=github)](https://github.com/onflux-tech/whatsmiau-manager/pkgs/container/whatsmiau-manager)

Self-hosted management dashboard for WhatsMiau WhatsApp API instances. Single binary, embedded SPA, zero external dependencies beyond your WhatsMiau API.

---

## Features

- **Multi-workspace** -- manage multiple WhatsMiau API servers from a single dashboard
- **Instance management** -- create, connect (QR/phone pairing), disconnect, and delete WhatsApp instances
- **Webhook configuration** -- configure per-instance webhook URLs, event filtering, and base64 media
- **Proxy settings** -- per-instance SOCKS5/HTTP/HTTPS proxy configuration
- **Health monitoring** -- automatic health checks with latency tracking and connection status
- **API Docs** -- built-in interactive API reference with playground, code generation, and request history
- **Adaptive polling** -- smart polling that adjusts frequency based on user activity
- **Real-time updates** -- PocketBase SSE for instant UI updates on data changes
- **Multi-arch Docker** -- pre-built images for `linux/amd64` and `linux/arm64`
- **Single binary** -- Go backend with embedded React SPA, no separate web server needed

## Quick Start

```yaml
# docker-compose.yml
services:
  manager:
    image: ghcr.io/onflux-tech/whatsmiau-manager:latest
    ports:
      - "8090:8090"
    volumes:
      - manager-data:/app/pb_data
    restart: unless-stopped

volumes:
  manager-data:
```

```bash
docker compose up -d
```

Open `http://localhost:8090` and create your admin account on first access.

### Add a Workspace

1. Click **Novo workspace**
2. Enter a name, the WhatsMiau API URL (e.g., `http://whatsmiau:8080`), and the API key
3. Your instances will appear automatically

## Configuration

| Environment Variable | Default | Description |
|---|---|---|
| `ENV` | - | Set to `dev` for development mode with auto-migrations |

PocketBase CLI flags are passed directly:

```bash
./manager serve --http=0.0.0.0:8090 --dir=/custom/data/path
```

## Development

**Requirements:** Go 1.25+, Node.js 22+, npm

```bash
cd manager

# Backend
ENV=dev go run main.go serve --http=0.0.0.0:8090

# Frontend (separate terminal)
cd site
npm install
npm run dev
```

The Vite dev server proxies `/api` and `/_` to `localhost:8090`.

### Build from Source

```bash
cd manager/site && npm ci && npm run build && cd ..
CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o manager main.go
./manager serve --http=0.0.0.0:8090
```

### Docker Build

```bash
cd manager
docker buildx build --platform linux/amd64,linux/arm64 -t whatsmiau-manager .
```

## Architecture

```
manager/
  main.go              # PocketBase bootstrap + version injection
  hub/
    hub.go             # Lifecycle hooks, event wiring
    routes.go          # REST API (setup, proxy, polling, version)
    proxy.go           # Reverse proxy to WhatsMiau API
    health.go          # Health checks and instance snapshot sync
    poller.go          # Adaptive polling engine
    spa.go             # Embedded SPA serving
  migrations/          # PocketBase schema migrations
  site/                # React SPA (Vite + TypeScript)
    src/
      components/      # UI components (workspace, instances, command)
      features/        # Feature modules (auth, docs)
      hooks/           # Shared React hooks
      lib/             # Utilities, types, PocketBase client
      stores/          # Zustand state stores
```

## Releases

Docker images are published to GHCR on every git tag (`v*`):

```bash
docker pull ghcr.io/onflux-tech/whatsmiau-manager:latest
docker pull ghcr.io/onflux-tech/whatsmiau-manager:0.1.0
```

---

## PT-BR

### Funcionalidades

- **Multi-workspace** -- gerencie multiplos servidores WhatsMiau API a partir de um unico painel
- **Gerenciamento de instancias** -- crie, conecte (QR/pareamento por telefone), desconecte e exclua instancias WhatsApp
- **Configuracao de webhooks** -- configure URLs de webhook por instancia, filtragem de eventos e midia em base64
- **Configuracao de proxy** -- proxy SOCKS5/HTTP/HTTPS por instancia
- **Monitoramento de saude** -- health checks automaticos com rastreamento de latencia e status de conexao
- **API Docs** -- referencia interativa com playground, geracao de codigo e historico de requests
- **Polling adaptativo** -- polling inteligente que ajusta a frequencia conforme a atividade do usuario
- **Atualizacoes em tempo real** -- SSE do PocketBase para atualizacoes instantaneas na UI
- **Docker multi-arch** -- imagens pre-compiladas para `linux/amd64` e `linux/arm64`
- **Binario unico** -- backend Go com SPA React embutido, sem necessidade de servidor web separado

### Inicio Rapido

```yaml
# docker-compose.yml
services:
  manager:
    image: ghcr.io/onflux-tech/whatsmiau-manager:latest
    ports:
      - "8090:8090"
    volumes:
      - manager-data:/app/pb_data
    restart: unless-stopped

volumes:
  manager-data:
```

```bash
docker compose up -d
```

Acesse `http://localhost:8090` e crie sua conta de administrador no primeiro acesso.

### Adicionar um Workspace

1. Clique em **Novo workspace**
2. Insira um nome, a URL da API WhatsMiau (ex: `http://whatsmiau:8080`) e a API key
3. Suas instancias aparecerao automaticamente

### Desenvolvimento

**Requisitos:** Go 1.25+, Node.js 22+, npm

```bash
cd manager

# Backend
ENV=dev go run main.go serve --http=0.0.0.0:8090

# Frontend (terminal separado)
cd site
npm install
npm run dev
```

### Build a partir do Codigo

```bash
cd manager/site && npm ci && npm run build && cd ..
CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o manager main.go
./manager serve --http=0.0.0.0:8090
```

---

## License

[MIT](LICENSE)
