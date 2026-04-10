import {
  FolderCog,
  Globe,
  Info,
  Link,
  MessageSquare,
  MonitorSmartphone,
  Radio,
  Webhook,
} from "lucide-react";
import type { ApiGroup } from "../types";

export const apiGroups: ApiGroup[] = [
  {
    id: "workspace-management",
    title: "Workspace Management",
    description:
      "Create, list, update, and delete workspaces. Each workspace represents a connection to a WhatsMiau API server with its own URL and API key.",
    icon: FolderCog,
    endpoints: [
      {
        id: "list-workspaces",
        title: "List Workspaces",
        method: "GET",
        path: "/api/collections/workspaces/records",
        description:
          "Returns all workspaces. The api_key field is stripped from the response for security. Supports PocketBase query parameters for pagination, filtering, and sorting.",
        auth: "required",
        queryParams: [
          {
            name: "page",
            type: "number",
            required: false,
            description: "Page number (default: 1)",
            example: "1",
          },
          {
            name: "perPage",
            type: "number",
            required: false,
            description: "Items per page (default: 30, max: 500)",
            example: "30",
          },
          {
            name: "sort",
            type: "string",
            required: false,
            description: 'Sort field with optional - prefix for DESC (e.g., "-created")',
            example: "-created",
          },
          {
            name: "filter",
            type: "string",
            required: false,
            description: "PocketBase filter expression",
            example: 'name~"prod"',
          },
        ],
        responseExample: JSON.stringify(
          {
            page: 1,
            perPage: 30,
            totalPages: 1,
            totalItems: 2,
            items: [
              {
                id: "abc123",
                name: "Production",
                url: "https://api.example.com",
                created: "2025-01-01 00:00:00.000Z",
                updated: "2025-01-01 00:00:00.000Z",
              },
            ],
          },
          null,
          2,
        ),
        curlExample: `curl http://localhost:8090/api/collections/workspaces/records \\
  -H "Authorization: YOUR_PB_TOKEN"`,
        jsExample: `const records = await pb.collection("workspaces").getFullList({
  sort: "-created",
});`,
      },
      {
        id: "create-workspace",
        title: "Create Workspace",
        method: "POST",
        path: "/api/collections/workspaces/records",
        description:
          "Creates a new workspace. The URL must be unique across all workspaces. After creation, the Manager immediately polls the WhatsMiau API for instance data.",
        auth: "required",
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "name",
              type: "string",
              required: true,
              description: "Workspace display name (max 100 characters)",
              example: "Production",
            },
            {
              name: "url",
              type: "string",
              required: true,
              description: "WhatsMiau API base URL (must be unique)",
              example: "https://api.example.com",
            },
            {
              name: "api_key",
              type: "string",
              required: true,
              description: "API key for authenticating with the WhatsMiau API",
              example: "your-api-key-here",
            },
          ],
        },
        responseExample: JSON.stringify(
          {
            id: "abc123",
            name: "Production",
            url: "https://api.example.com",
            created: "2025-01-01 00:00:00.000Z",
            updated: "2025-01-01 00:00:00.000Z",
          },
          null,
          2,
        ),
        curlExample: `curl -X POST http://localhost:8090/api/collections/workspaces/records \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Production", "url": "https://api.example.com", "api_key": "your-api-key"}'`,
        jsExample: `const record = await pb.collection("workspaces").create({
  name: "Production",
  url: "https://api.example.com",
  api_key: "your-api-key",
});`,
      },
      {
        id: "get-workspace",
        title: "Get Workspace",
        method: "GET",
        path: "/api/collections/workspaces/records/{id}",
        description:
          "Returns a single workspace by ID. The api_key field is stripped from the response.",
        auth: "required",
        parameters: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Workspace record ID",
            example: "abc123",
          },
        ],
        responseExample: JSON.stringify(
          {
            id: "abc123",
            name: "Production",
            url: "https://api.example.com",
            created: "2025-01-01 00:00:00.000Z",
            updated: "2025-01-01 00:00:00.000Z",
          },
          null,
          2,
        ),
        curlExample: `curl http://localhost:8090/api/collections/workspaces/records/{id} \\
  -H "Authorization: YOUR_PB_TOKEN"`,
        jsExample: `const record = await pb.collection("workspaces").getOne("abc123");`,
      },
      {
        id: "update-workspace",
        title: "Update Workspace",
        method: "PATCH",
        path: "/api/collections/workspaces/records/{id}",
        description:
          "Updates a workspace. Send only the fields you want to change. After update, the Manager re-polls the WhatsMiau API for instance data.",
        auth: "required",
        parameters: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Workspace record ID",
            example: "abc123",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "name",
              type: "string",
              required: false,
              description: "Updated display name",
              example: "Staging",
            },
            {
              name: "url",
              type: "string",
              required: false,
              description: "Updated WhatsMiau API URL",
              example: "https://staging.example.com",
            },
            {
              name: "api_key",
              type: "string",
              required: false,
              description: "Updated API key",
              example: "new-api-key",
            },
          ],
        },
        responseExample: JSON.stringify(
          {
            id: "abc123",
            name: "Staging",
            url: "https://staging.example.com",
            created: "2025-01-01 00:00:00.000Z",
            updated: "2025-01-02 00:00:00.000Z",
          },
          null,
          2,
        ),
        curlExample: `curl -X PATCH http://localhost:8090/api/collections/workspaces/records/{id} \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Staging"}'`,
        jsExample: `const record = await pb.collection("workspaces").update("abc123", {
  name: "Staging",
});`,
      },
      {
        id: "delete-workspace",
        title: "Delete Workspace",
        method: "DELETE",
        path: "/api/collections/workspaces/records/{id}",
        description:
          "Deletes a workspace and all associated health checks and instance snapshots (cascade delete). The Manager stops polling for this workspace immediately.",
        auth: "required",
        parameters: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "Workspace record ID",
            example: "abc123",
          },
        ],
        curlExample: `curl -X DELETE http://localhost:8090/api/collections/workspaces/records/{id} \\
  -H "Authorization: YOUR_PB_TOKEN"`,
        jsExample: `await pb.collection("workspaces").delete("abc123");`,
      },
    ],
  },
  {
    id: "system",
    title: "System",
    description: "System endpoints for version info, health monitoring, and initial setup.",
    icon: Info,
    endpoints: [
      {
        id: "get-version",
        title: "Get Version",
        method: "GET",
        path: "/api/version",
        description:
          "Returns the Manager version string. In production builds, this matches the git tag used to build the Docker image.",
        auth: "public",
        responseExample: JSON.stringify({ version: "v0.1.0" }, null, 2),
        curlExample: `curl http://localhost:8090/api/version`,
        jsExample: `const res = await fetch("/api/version");
const { version } = await res.json();`,
      },
      {
        id: "setup-status",
        title: "Check Setup Status",
        method: "GET",
        path: "/api/setup/status",
        description:
          "Checks if the initial superuser account has been created. Returns true if no admin exists yet.",
        auth: "public",
        responseExample: JSON.stringify({ needsSetup: true }, null, 2),
        curlExample: `curl http://localhost:8090/api/setup/status`,
        jsExample: `const res = await fetch("/api/setup/status");
const { needsSetup } = await res.json();`,
      },
      {
        id: "create-setup",
        title: "Initial Setup",
        method: "POST",
        path: "/api/setup",
        description:
          "Creates the first superuser account. This endpoint can only be called once. Returns 403 if a superuser already exists.",
        auth: "public",
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "email",
              type: "string",
              required: true,
              description: "Admin email address",
              example: "admin@example.com",
            },
            {
              name: "password",
              type: "string",
              required: true,
              description: "Admin password (minimum 8 characters)",
              example: "your-password",
            },
          ],
        },
        responseExample: JSON.stringify({ message: "ok" }, null, 2),
        curlExample: `curl -X POST http://localhost:8090/api/setup \\
  -H "Content-Type: application/json" \\
  -d '{"email": "admin@example.com", "password": "your-password"}'`,
        jsExample: `const res = await fetch("/api/setup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "admin@example.com",
    password: "your-password",
  }),
});`,
      },
    ],
  },
  {
    id: "instance-management",
    title: "Instance Management",
    description:
      "Create, list, update, and delete WhatsApp instances. Each instance represents a WhatsApp session managed by the WhatsMiau API.",
    icon: MonitorSmartphone,
    endpoints: [
      {
        id: "list-instances",
        title: "List Instances",
        method: "GET",
        path: "/api/proxy/{wid}/instance",
        description:
          "Returns all WhatsApp instances registered in the workspace. Each instance includes its ID, name, status, and connected phone number.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
        ],
        responseExample: JSON.stringify(
          [
            {
              id: "my-instance",
              name: "My Instance",
              status: "open",
              phone: "5511999999999",
            },
          ],
          null,
          2,
        ),
        curlExample: `curl http://localhost:8090/api/proxy/{wid}/instance \\
  -H "Authorization: YOUR_PB_TOKEN"`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance", {
  headers: { Authorization: pb.authStore.token },
});
const instances = await res.json();`,
      },
      {
        id: "create-instance",
        title: "Create Instance",
        method: "POST",
        path: "/api/proxy/{wid}/instance",
        description:
          "Creates a new WhatsApp instance. After creation, use the Connect endpoint to pair it with a phone via QR code or pairing code.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "instanceName",
              type: "string",
              required: true,
              description:
                "Unique instance identifier and display name (slug-friendly). This value is also used as the instance ID.",
              example: "my-instance",
            },
          ],
        },
        responseExample: JSON.stringify(
          {
            id: "my-instance",
            instanceName: "my-instance",
            status: "closed",
          },
          null,
          2,
        ),
        curlExample: `curl -X POST http://localhost:8090/api/proxy/{wid}/instance \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"instanceName": "my-instance"}'`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    instanceName: "my-instance",
  }),
});`,
      },
      {
        id: "get-instance-status",
        title: "Get Instance Status",
        method: "GET",
        path: "/api/proxy/{wid}/instance/{iid}/status",
        description:
          "Returns the current connection state of an instance. Possible states: open, connecting, qr-code, closed.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        responseExample: JSON.stringify({ state: "open" }, null, 2),
        curlExample: `curl http://localhost:8090/api/proxy/{wid}/instance/{iid}/status \\
  -H "Authorization: YOUR_PB_TOKEN"`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance/{iid}/status", {
  headers: { Authorization: pb.authStore.token },
});
const { state } = await res.json();`,
      },
      {
        id: "delete-instance",
        title: "Delete Instance",
        method: "DELETE",
        path: "/api/proxy/{wid}/instance/{iid}",
        description:
          "Deletes an instance. The WhatsMiau API will logout the WhatsApp session before removing it.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        curlExample: `curl -X DELETE http://localhost:8090/api/proxy/{wid}/instance/{iid} \\
  -H "Authorization: YOUR_PB_TOKEN"`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance/{iid}", {
  method: "DELETE",
  headers: { Authorization: pb.authStore.token },
});`,
      },
      {
        id: "sync-instances",
        title: "Sync Instances",
        method: "POST",
        path: "/api/proxy/{wid}/sync",
        description:
          "Triggers a synchronization between the WhatsMiau API and the Manager's PocketBase database. This fetches the latest instance list and updates snapshots.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
        ],
        responseExample: JSON.stringify({ message: "ok" }, null, 2),
        curlExample: `curl -X POST http://localhost:8090/api/proxy/{wid}/sync \\
  -H "Authorization: YOUR_PB_TOKEN"`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/sync", {
  method: "POST",
  headers: { Authorization: pb.authStore.token },
});`,
      },
    ],
  },
  {
    id: "instance-connection",
    title: "Instance Connection",
    description: "Connect, disconnect and pair WhatsApp instances via QR code or pairing code.",
    icon: Link,
    endpoints: [
      {
        id: "connect-instance",
        title: "Connect Instance",
        method: "POST",
        path: "/api/proxy/{wid}/instance/{iid}/connect",
        description:
          "Initiates a connection for the instance. Without a body, it starts QR code pairing. With a `number` field in the body, it returns an 8-digit pairing code for phone number linking.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "number",
              type: "string",
              required: false,
              description:
                "Phone number with country code for pairing code mode. Omit for QR code mode.",
              example: "5511999999999",
            },
          ],
        },
        responseExample: JSON.stringify(
          {
            base64: "data:image/png;base64,...",
            pairingCode: "ABCD-EFGH",
            connected: false,
            message: "QR code generated",
          },
          null,
          2,
        ),
        curlExample: `# QR code mode
curl -X POST http://localhost:8090/api/proxy/{wid}/instance/{iid}/connect \\
  -H "Authorization: YOUR_PB_TOKEN"

# Pairing code mode
curl -X POST http://localhost:8090/api/proxy/{wid}/instance/{iid}/connect \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"number": "5511999999999"}'`,
        jsExample: `// QR code mode
const res = await fetch("/api/proxy/{wid}/instance/{iid}/connect", {
  method: "POST",
  headers: { Authorization: pb.authStore.token },
});
const { base64, pairingCode } = await res.json();

// Pairing code mode
const res2 = await fetch("/api/proxy/{wid}/instance/{iid}/connect", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ number: "5511999999999" }),
});`,
      },
      {
        id: "get-qr-code",
        title: "Get QR Code Image",
        method: "GET",
        path: "/api/proxy/{wid}/instance/{iid}/qr",
        description:
          "Returns the QR code as a PNG image. Use this to display the QR code directly in an img tag. The instance must be in connecting/qr-code state.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        curlExample: `curl http://localhost:8090/api/proxy/{wid}/instance/{iid}/qr \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  --output qr.png`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance/{iid}/qr", {
  headers: { Authorization: pb.authStore.token },
});
const blob = await res.blob();
const url = URL.createObjectURL(blob);
// Use url in an <img> tag`,
      },
      {
        id: "logout-instance",
        title: "Logout Instance",
        method: "POST",
        path: "/api/proxy/{wid}/instance/{iid}/logout",
        description:
          "Disconnects the WhatsApp session and clears the device store. The instance remains registered but will need to be reconnected.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        curlExample: `curl -X POST http://localhost:8090/api/proxy/{wid}/instance/{iid}/logout \\
  -H "Authorization: YOUR_PB_TOKEN"`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance/{iid}/logout", {
  method: "POST",
  headers: { Authorization: pb.authStore.token },
});`,
      },
    ],
  },
  {
    id: "webhook-config",
    title: "Webhook Configuration",
    description:
      "Configure webhook endpoints to receive real-time events from your WhatsApp instances (messages, status changes, etc).",
    icon: Webhook,
    endpoints: [
      {
        id: "get-webhook",
        title: "Get Webhook Config",
        method: "GET",
        path: "/api/proxy/{wid}/webhook/{iid}",
        description:
          "Returns the current webhook configuration for an instance, including the URL, enabled status, and subscribed events.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        responseExample: JSON.stringify(
          {
            webhook: {
              url: "https://example.com/webhook",
              enabled: true,
              events: ["messages", "status"],
              byEvents: false,
              base64: false,
            },
          },
          null,
          2,
        ),
        curlExample: `curl http://localhost:8090/api/proxy/{wid}/webhook/{iid} \\
  -H "Authorization: YOUR_PB_TOKEN"`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/webhook/{iid}", {
  headers: { Authorization: pb.authStore.token },
});
const { webhook } = await res.json();`,
      },
      {
        id: "set-webhook",
        title: "Set Webhook Config",
        method: "POST",
        path: "/api/proxy/{wid}/webhook/{iid}",
        description:
          "Creates or updates the webhook configuration for an instance. The body must be wrapped in a webhook object. Set the URL, enable/disable, choose events, and optionally add custom headers.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "webhook.url",
              type: "string",
              required: false,
              description: "Webhook delivery URL",
              example: "https://example.com/webhook",
            },
            {
              name: "webhook.enabled",
              type: "boolean",
              required: false,
              description: "Enable or disable the webhook",
              example: "true",
            },
            {
              name: "webhook.events",
              type: "string[]",
              required: false,
              description: "List of event types to subscribe to",
              example: '["messages", "status"]',
            },
            {
              name: "webhook.headers",
              type: "object",
              required: false,
              description: "Custom headers sent with webhook requests (key-value pairs)",
              example: '{"X-Custom": "value"}',
            },
            {
              name: "webhook.byEvents",
              type: "boolean",
              required: false,
              description: "If true, sends events to separate sub-paths by event type",
              example: "false",
            },
            {
              name: "webhook.base64",
              type: "boolean",
              required: false,
              description: "If true, media payloads are sent as base64",
              example: "false",
            },
          ],
        },
        curlExample: `curl -X POST http://localhost:8090/api/proxy/{wid}/webhook/{iid} \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"webhook": {"url": "https://example.com/webhook", "enabled": true, "events": ["messages", "status"]}}'`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/webhook/{iid}", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    webhook: {
      url: "https://example.com/webhook",
      enabled: true,
      events: ["messages", "status"],
    },
  }),
});`,
      },
    ],
  },
  {
    id: "proxy-config",
    title: "Proxy Configuration",
    description:
      "Configure HTTP/SOCKS5 proxy settings for WhatsApp instances. Proxies are applied at the WhatsApp connection level, routing all traffic through the specified proxy server.",
    icon: Globe,
    endpoints: [
      {
        id: "set-proxy-config",
        title: "Set Proxy Config",
        method: "PUT",
        path: "/api/proxy/{wid}/instance/{iid}",
        description:
          "Updates the proxy configuration for an instance. Supports HTTP, HTTPS, and SOCKS5 protocols. Send only the fields you want to change — omitted fields remain unchanged. To remove the proxy, send an empty proxyHost. The proxy takes effect on the next connection. Note: proxy fields only appear in the List Instances response when configured (omitted when empty).",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "proxyHost",
              type: "string",
              required: false,
              description: "Proxy host address. Send empty string to remove proxy.",
              example: "proxy.example.com",
            },
            {
              name: "proxyPort",
              type: "string",
              required: false,
              description: "Proxy port number",
              example: "1080",
            },
            {
              name: "proxyProtocol",
              type: "string",
              required: false,
              description: "Proxy protocol: http, https, or socks5",
              example: "socks5",
            },
            {
              name: "proxyUsername",
              type: "string",
              required: false,
              description: "Proxy authentication username",
              example: "user",
            },
            {
              name: "proxyPassword",
              type: "string",
              required: false,
              description: "Proxy authentication password",
              example: "pass",
            },
          ],
        },
        responseExample: JSON.stringify(
          {
            id: "my-instance",
            name: "My Instance",
            proxyHost: "proxy.example.com",
            proxyPort: "1080",
            proxyProtocol: "socks5",
            proxyUsername: "user",
            proxyPassword: "pass",
          },
          null,
          2,
        ),
        curlExample: `curl -X PUT http://localhost:8090/api/proxy/{wid}/instance/{iid} \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"proxyHost": "proxy.example.com", "proxyPort": "1080", "proxyProtocol": "socks5"}'`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance/{iid}", {
  method: "PUT",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    proxyHost: "proxy.example.com",
    proxyPort: "1080",
    proxyProtocol: "socks5",
    proxyUsername: "user",
    proxyPassword: "pass",
  }),
});`,
      },
    ],
  },
  {
    id: "messages",
    title: "Messages",
    description:
      "Send text, image, audio, document, list, and button messages through WhatsApp instances.",
    icon: MessageSquare,
    endpoints: [
      {
        id: "send-text",
        title: "Send Text",
        method: "POST",
        path: "/api/proxy/{wid}/instance/{iid}/message/text",
        description:
          "Sends a text message. Supports link previews, mentions, quoting a previous message, and an optional simulated typing delay.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "number",
              type: "string",
              required: true,
              description: "Recipient phone number with country code or group JID",
              example: "5511999999999",
            },
            {
              name: "text",
              type: "string",
              required: true,
              description: "Message text content",
              example: "Hello from WhatsMiau!",
            },
            {
              name: "delay",
              type: "number",
              required: false,
              description: "Simulated typing delay in milliseconds (0–300000)",
              example: "1000",
            },
            {
              name: "linkPreview",
              type: "boolean",
              required: false,
              description: "Generate a link preview if the text contains a URL",
              example: "true",
            },
            {
              name: "mentionsEveryOne",
              type: "boolean",
              required: false,
              description: "Mention all participants (groups only)",
              example: "false",
            },
            {
              name: "mentioned",
              type: "string[]",
              required: false,
              description: "List of JIDs to mention",
              example: '["5511999999999@s.whatsapp.net"]',
            },
            {
              name: "quoted",
              type: "object",
              required: false,
              description:
                'Quote a previous message. Format: { "key": { "id": "MSG_ID" }, "message": { "conversation": "original text" } }',
            },
          ],
        },
        responseExample: JSON.stringify(
          {
            key: {
              remoteJid: "5511999999999@s.whatsapp.net",
              fromMe: true,
              id: "3EB0ABCDEF123456",
            },
            message: { conversation: "Hello from WhatsMiau!" },
            status: "PENDING",
          },
          null,
          2,
        ),
        curlExample: `curl -X POST http://localhost:8090/api/proxy/{wid}/instance/{iid}/message/text \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"number": "5511999999999", "text": "Hello from WhatsMiau!"}'`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance/{iid}/message/text", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    number: "5511999999999",
    text: "Hello from WhatsMiau!",
  }),
});`,
      },
      {
        id: "send-image",
        title: "Send Image",
        method: "POST",
        path: "/api/proxy/{wid}/instance/{iid}/message/image",
        description:
          "Sends an image message from a URL. Supports optional caption, quoting, and mentions.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "number",
              type: "string",
              required: true,
              description: "Recipient phone number or group JID",
              example: "5511999999999",
            },
            {
              name: "media",
              type: "string",
              required: true,
              description: "Public URL of the image file",
              example: "https://example.com/photo.jpg",
            },
            {
              name: "caption",
              type: "string",
              required: false,
              description: "Image caption",
              example: "Check this out!",
            },
            {
              name: "mimetype",
              type: "string",
              required: false,
              description: "MIME type override (auto-detected from URL if omitted)",
              example: "image/jpeg",
            },
            {
              name: "fileName",
              type: "string",
              required: false,
              description: "Custom file name",
              example: "photo.jpg",
            },
            {
              name: "delay",
              type: "number",
              required: false,
              description: "Simulated typing delay in ms (0–300000)",
              example: "1000",
            },
          ],
        },
        responseExample: JSON.stringify(
          {
            key: {
              remoteJid: "5511999999999@s.whatsapp.net",
              fromMe: true,
              id: "3EB0ABCDEF123456",
            },
            message: {
              imageMessage: { caption: "Check this out!", mimetype: "image/jpeg" },
            },
            status: "PENDING",
          },
          null,
          2,
        ),
        curlExample: `curl -X POST http://localhost:8090/api/proxy/{wid}/instance/{iid}/message/image \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"number": "5511999999999", "media": "https://example.com/photo.jpg", "caption": "Check this out!"}'`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance/{iid}/message/image", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    number: "5511999999999",
    media: "https://example.com/photo.jpg",
    caption: "Check this out!",
  }),
});`,
      },
      {
        id: "send-audio",
        title: "Send Audio",
        method: "POST",
        path: "/api/proxy/{wid}/instance/{iid}/message/audio",
        description:
          "Sends an audio message from a URL. The audio is sent as a voice note (PTT). Set encoding to true to convert the audio to Opus/OGG format on the server.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "number",
              type: "string",
              required: true,
              description: "Recipient phone number or group JID",
              example: "5511999999999",
            },
            {
              name: "audio",
              type: "string",
              required: true,
              description: "Public URL of the audio file",
              example: "https://example.com/voice.ogg",
            },
            {
              name: "encoding",
              type: "boolean",
              required: false,
              description: "Convert to Opus/OGG on the server before sending",
              example: "false",
            },
            {
              name: "delay",
              type: "number",
              required: false,
              description: "Simulated typing delay in ms (0–300000)",
              example: "2000",
            },
          ],
        },
        responseExample: JSON.stringify(
          {
            key: {
              remoteJid: "5511999999999@s.whatsapp.net",
              fromMe: true,
              id: "3EB0ABCDEF123456",
            },
            message: {
              audioMessage: { mimetype: "audio/ogg; codecs=opus", ptt: true },
            },
            status: "PENDING",
          },
          null,
          2,
        ),
        curlExample: `curl -X POST http://localhost:8090/api/proxy/{wid}/instance/{iid}/message/audio \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"number": "5511999999999", "audio": "https://example.com/voice.ogg"}'`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance/{iid}/message/audio", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    number: "5511999999999",
    audio: "https://example.com/voice.ogg",
  }),
});`,
      },
      {
        id: "send-document",
        title: "Send Document",
        method: "POST",
        path: "/api/proxy/{wid}/instance/{iid}/message/document",
        description:
          "Sends a document/file message from a URL. Supports any file type — the recipient sees it as a downloadable attachment with the given file name.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "number",
              type: "string",
              required: true,
              description: "Recipient phone number or group JID",
              example: "5511999999999",
            },
            {
              name: "media",
              type: "string",
              required: true,
              description: "Public URL of the document file",
              example: "https://example.com/report.pdf",
            },
            {
              name: "fileName",
              type: "string",
              required: false,
              description: "Display file name for the recipient",
              example: "report.pdf",
            },
            {
              name: "mimetype",
              type: "string",
              required: false,
              description: "MIME type override (auto-detected if omitted)",
              example: "application/pdf",
            },
            {
              name: "caption",
              type: "string",
              required: false,
              description: "Document caption",
              example: "Monthly report",
            },
            {
              name: "delay",
              type: "number",
              required: false,
              description: "Simulated typing delay in ms (0–300000)",
              example: "1000",
            },
          ],
        },
        responseExample: JSON.stringify(
          {
            key: {
              remoteJid: "5511999999999@s.whatsapp.net",
              fromMe: true,
              id: "3EB0ABCDEF123456",
            },
            message: {
              documentMessage: {
                mimetype: "application/pdf",
                fileName: "report.pdf",
              },
            },
            status: "PENDING",
          },
          null,
          2,
        ),
        curlExample: `curl -X POST http://localhost:8090/api/proxy/{wid}/instance/{iid}/message/document \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"number": "5511999999999", "media": "https://example.com/report.pdf", "fileName": "report.pdf"}'`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance/{iid}/message/document", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    number: "5511999999999",
    media: "https://example.com/report.pdf",
    fileName: "report.pdf",
  }),
});`,
      },
      {
        id: "send-list",
        title: "Send List",
        method: "POST",
        path: "/api/proxy/{wid}/instance/{iid}/message/list",
        description:
          "Sends an interactive list message with selectable rows grouped into sections. The user taps a button to open the list and selects one option.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "number",
              type: "string",
              required: true,
              description: "Recipient phone number or group JID",
              example: "5511999999999",
            },
            {
              name: "title",
              type: "string",
              required: false,
              description: "List header title",
              example: "Our Menu",
            },
            {
              name: "description",
              type: "string",
              required: true,
              description: "List body text shown before the button",
              example: "Choose an option below",
            },
            {
              name: "buttonText",
              type: "string",
              required: false,
              description: "Label of the button that opens the list",
              example: "View options",
            },
            {
              name: "footerText",
              type: "string",
              required: false,
              description: "Small footer text below the body",
              example: "Powered by WhatsMiau",
            },
            {
              name: "sections",
              type: "Section[]",
              required: true,
              description:
                'Array of sections. Each section: { "title": "...", "rows": [{ "title": "...", "description": "...", "rowId": "..." }] }',
              example: JSON.stringify([
                {
                  title: "Drinks",
                  rows: [
                    { title: "Coffee", description: "Hot coffee", rowId: "coffee" },
                    { title: "Tea", description: "Green tea", rowId: "tea" },
                  ],
                },
              ]),
            },
            {
              name: "delay",
              type: "number",
              required: false,
              description: "Simulated typing delay in ms (0–300000)",
              example: "1000",
            },
          ],
        },
        responseExample: JSON.stringify(
          {
            key: {
              remoteJid: "5511999999999@s.whatsapp.net",
              fromMe: true,
              id: "3EB0ABCDEF123456",
            },
            status: "PENDING",
          },
          null,
          2,
        ),
        curlExample: `curl -X POST http://localhost:8090/api/proxy/{wid}/instance/{iid}/message/list \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
  "number": "5511999999999",
  "title": "Our Menu",
  "description": "Choose an option below",
  "buttonText": "View options",
  "sections": [
    {
      "title": "Drinks",
      "rows": [
        { "title": "Coffee", "description": "Hot coffee", "rowId": "coffee" },
        { "title": "Tea", "description": "Green tea", "rowId": "tea" }
      ]
    }
  ]
}'`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance/{iid}/message/list", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    number: "5511999999999",
    title: "Our Menu",
    description: "Choose an option below",
    buttonText: "View options",
    sections: [
      {
        title: "Drinks",
        rows: [
          { title: "Coffee", description: "Hot coffee", rowId: "coffee" },
          { title: "Tea", description: "Green tea", rowId: "tea" },
        ],
      },
    ],
  }),
});`,
      },
      {
        id: "send-buttons",
        title: "Send Buttons / PIX",
        method: "POST",
        path: "/api/proxy/{wid}/instance/{iid}/message/buttons",
        description:
          'Sends an interactive button message (up to 3 buttons). Each button can be a "reply" button or a "pix" payment button with Brazilian PIX payment data.',
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "number",
              type: "string",
              required: true,
              description: "Recipient phone number or group JID",
              example: "5511999999999",
            },
            {
              name: "title",
              type: "string",
              required: false,
              description: "Message header title",
              example: "Confirm your order",
            },
            {
              name: "description",
              type: "string",
              required: true,
              description: "Message body text",
              example: "Would you like to proceed?",
            },
            {
              name: "footer",
              type: "string",
              required: false,
              description: "Footer text",
              example: "WhatsMiau Store",
            },
            {
              name: "buttons",
              type: "Button[]",
              required: true,
              description:
                'Array of 1–3 buttons. Reply: { "type": "reply", "displayText": "Yes", "id": "btn-yes" }. PIX: { "type": "pix", "displayText": "Pay", "name": "Store", "keyType": "cpf", "key": "12345678900", "currency": "BRL" }',
              example: JSON.stringify([
                { type: "reply", displayText: "Yes", id: "btn-yes" },
                { type: "reply", displayText: "No", id: "btn-no" },
              ]),
            },
            {
              name: "delay",
              type: "number",
              required: false,
              description: "Simulated typing delay in ms (0–300000)",
              example: "1000",
            },
          ],
        },
        responseExample: JSON.stringify(
          {
            key: {
              remoteJid: "5511999999999@s.whatsapp.net",
              fromMe: true,
              id: "3EB0ABCDEF123456",
            },
            status: "PENDING",
          },
          null,
          2,
        ),
        curlExample: `# Reply buttons
curl -X POST http://localhost:8090/api/proxy/{wid}/instance/{iid}/message/buttons \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
  "number": "5511999999999",
  "title": "Confirm your order",
  "description": "Would you like to proceed?",
  "buttons": [
    { "type": "reply", "displayText": "Yes", "id": "btn-yes" },
    { "type": "reply", "displayText": "No", "id": "btn-no" }
  ]
}'

# PIX payment button
curl -X POST http://localhost:8090/api/proxy/{wid}/instance/{iid}/message/buttons \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
  "number": "5511999999999",
  "title": "Payment",
  "description": "Pay R$ 25.00 for your order",
  "footer": "WhatsMiau Store",
  "buttons": [
    {
      "type": "pix",
      "displayText": "Pay with PIX",
      "name": "WhatsMiau Store",
      "keyType": "cpf",
      "key": "12345678900",
      "currency": "BRL"
    }
  ]
}'`,
        jsExample: `// Reply buttons
const res = await fetch("/api/proxy/{wid}/instance/{iid}/message/buttons", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    number: "5511999999999",
    title: "Confirm your order",
    description: "Would you like to proceed?",
    buttons: [
      { type: "reply", displayText: "Yes", id: "btn-yes" },
      { type: "reply", displayText: "No", id: "btn-no" },
    ],
  }),
});

// PIX payment button
const res2 = await fetch("/api/proxy/{wid}/instance/{iid}/message/buttons", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    number: "5511999999999",
    title: "Payment",
    description: "Pay R$ 25.00 for your order",
    footer: "WhatsMiau Store",
    buttons: [
      {
        type: "pix",
        displayText: "Pay with PIX",
        name: "WhatsMiau Store",
        keyType: "cpf",
        key: "12345678900",
        currency: "BRL",
      },
    ],
  }),
});`,
      },
      {
        id: "send-reaction",
        title: "Send Reaction",
        method: "POST",
        path: "/api/proxy/{wid}/instance/{iid}/message/reaction",
        description:
          "Sends an emoji reaction to a specific message. The reaction must be a single emoji character.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "reaction",
              type: "string",
              required: true,
              description: "Single emoji character",
              example: "\u{1F44D}",
            },
            {
              name: "key",
              type: "object",
              required: true,
              description:
                'Message key to react to: { "remoteJid": "...", "id": "...", "fromMe": false }',
              example: JSON.stringify({
                remoteJid: "5511999999999@s.whatsapp.net",
                id: "3EB0ABCDEF123456",
                fromMe: false,
              }),
            },
          ],
        },
        responseExample: JSON.stringify(
          {
            key: {
              remoteJid: "5511999999999@s.whatsapp.net",
              fromMe: true,
              id: "3EB0GHIJKL789012",
            },
            status: "sent",
            messageType: "reactionMessage",
          },
          null,
          2,
        ),
        curlExample: `curl -X POST http://localhost:8090/api/proxy/{wid}/instance/{iid}/message/reaction \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
  "reaction": "\u{1F44D}",
  "key": {
    "remoteJid": "5511999999999@s.whatsapp.net",
    "id": "3EB0ABCDEF123456",
    "fromMe": false
  }
}'`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance/{iid}/message/reaction", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    reaction: "\u{1F44D}",
    key: {
      remoteJid: "5511999999999@s.whatsapp.net",
      id: "3EB0ABCDEF123456",
      fromMe: false,
    },
  }),
});`,
      },
      {
        id: "send-media",
        title: "Send Media",
        method: "POST",
        path: "/api/proxy/{wid}/instance/{iid}/message/media",
        description:
          'Sends a media file using the generic media endpoint. Set mediatype to "image" for images, or omit for documents. For specific media types, prefer the dedicated image, audio, or document endpoints.',
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "number",
              type: "string",
              required: true,
              description: "Recipient phone number or group JID",
              example: "5511999999999",
            },
            {
              name: "mediatype",
              type: "string",
              required: false,
              description: 'Media type: "image" or omit for document',
              example: "image",
            },
            {
              name: "media",
              type: "string",
              required: true,
              description: "Public URL of the media file",
              example: "https://example.com/photo.jpg",
            },
            {
              name: "caption",
              type: "string",
              required: false,
              description: "Media caption",
              example: "Check this out!",
            },
            {
              name: "fileName",
              type: "string",
              required: false,
              description: "Display file name",
              example: "photo.jpg",
            },
            {
              name: "mimetype",
              type: "string",
              required: false,
              description: "MIME type override (auto-detected if omitted)",
              example: "image/jpeg",
            },
          ],
        },
        responseExample: JSON.stringify(
          {
            key: {
              remoteJid: "5511999999999@s.whatsapp.net",
              fromMe: true,
              id: "3EB0ABCDEF123456",
            },
            status: "sent",
            messageType: "imageMessage",
          },
          null,
          2,
        ),
        curlExample: `curl -X POST http://localhost:8090/api/proxy/{wid}/instance/{iid}/message/media \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"number": "5511999999999", "mediatype": "image", "media": "https://example.com/photo.jpg", "caption": "Check this out!"}'`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance/{iid}/message/media", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    number: "5511999999999",
    mediatype: "image",
    media: "https://example.com/photo.jpg",
    caption: "Check this out!",
  }),
});`,
      },
    ],
  },
  {
    id: "chat",
    title: "Chat",
    description:
      "Chat-level actions: typing indicators, read receipts, message deletion, and number validation.",
    icon: Radio,
    endpoints: [
      {
        id: "send-presence",
        title: "Send Chat Presence",
        method: "POST",
        path: "/api/proxy/{wid}/instance/{iid}/chat/presence",
        description:
          'Sends a chat presence (typing indicator) to a contact or group. Use presence "composing" for typing and "available" to clear. The type field specifies "text" (typing dots) or "audio" (recording indicator).',
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "number",
              type: "string",
              required: true,
              description: "Recipient phone number or group JID",
              example: "5511999999999",
            },
            {
              name: "presence",
              type: "string",
              required: true,
              description: 'Presence state: "composing" or "available"',
              example: "composing",
            },
            {
              name: "type",
              type: "string",
              required: true,
              description: 'Presence type: "text" (typing dots) or "audio" (recording indicator)',
              example: "text",
            },
            {
              name: "delay",
              type: "number",
              required: false,
              description: "Delay in ms before sending the presence (0–300000)",
              example: "0",
            },
          ],
        },
        responseExample: JSON.stringify({}, null, 2),
        curlExample: `curl -X POST http://localhost:8090/api/proxy/{wid}/instance/{iid}/chat/presence \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"number": "5511999999999", "presence": "composing", "type": "text"}'`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance/{iid}/chat/presence", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    number: "5511999999999",
    presence: "composing",
    type: "text",
  }),
});`,
      },
      {
        id: "read-messages",
        title: "Mark Messages as Read",
        method: "POST",
        path: "/api/proxy/{wid}/instance/{iid}/chat/read-messages",
        description:
          "Marks one or more messages as read (sends blue checkmarks). Messages are grouped by conversation and processed in batch.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "readMessages",
              type: "object[]",
              required: true,
              description:
                'Array of messages to mark as read. Each: { "remoteJid": "...", "id": "...", "sender": "..." }. The sender field is required for group messages.',
              example: JSON.stringify([
                {
                  remoteJid: "5511999999999@s.whatsapp.net",
                  id: "3EB0ABCDEF123456",
                },
              ]),
            },
          ],
        },
        responseExample: JSON.stringify({}, null, 2),
        curlExample: `curl -X POST http://localhost:8090/api/proxy/{wid}/instance/{iid}/chat/read-messages \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
  "readMessages": [
    { "remoteJid": "5511999999999@s.whatsapp.net", "id": "3EB0ABCDEF123456" }
  ]
}'`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance/{iid}/chat/read-messages", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    readMessages: [
      { remoteJid: "5511999999999@s.whatsapp.net", id: "3EB0ABCDEF123456" },
    ],
  }),
});`,
      },
      {
        id: "delete-message",
        title: "Delete Message for Everyone",
        method: "DELETE",
        path: "/api/proxy/{wid}/instance/{iid}/chat/delete-message",
        description:
          'Revokes a message for all participants. For group messages sent by others, the "participant" field is required.',
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "id",
              type: "string",
              required: true,
              description: "Message ID to delete",
              example: "3EB0ABCDEF123456",
            },
            {
              name: "remoteJid",
              type: "string",
              required: true,
              description: "Chat JID where the message was sent",
              example: "5511999999999@s.whatsapp.net",
            },
            {
              name: "fromMe",
              type: "boolean",
              required: false,
              description: "Whether the message was sent by you",
              example: "true",
            },
            {
              name: "participant",
              type: "string",
              required: false,
              description: "Sender JID (required when deleting another user's message in a group)",
              example: "5511888888888@s.whatsapp.net",
            },
          ],
        },
        responseExample: JSON.stringify({}, null, 2),
        curlExample: `curl -X DELETE http://localhost:8090/api/proxy/{wid}/instance/{iid}/chat/delete-message \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"id": "3EB0ABCDEF123456", "remoteJid": "5511999999999@s.whatsapp.net", "fromMe": true}'`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance/{iid}/chat/delete-message", {
  method: "DELETE",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: "3EB0ABCDEF123456",
    remoteJid: "5511999999999@s.whatsapp.net",
    fromMe: true,
  }),
});`,
      },
      {
        id: "check-number",
        title: "Check WhatsApp Numbers",
        method: "POST",
        path: "/api/proxy/{wid}/instance/{iid}/chat/check-number",
        description:
          "Checks if one or more phone numbers are registered on WhatsApp. Returns the WhatsApp JID and LID for each number.",
        auth: "required",
        parameters: [
          {
            name: "wid",
            type: "string",
            required: true,
            description: "Workspace ID",
            example: "abc123",
          },
          {
            name: "iid",
            type: "string",
            required: true,
            description: "Instance ID",
            example: "my-instance",
          },
        ],
        requestBody: {
          contentType: "application/json",
          fields: [
            {
              name: "numbers",
              type: "string[]",
              required: true,
              description: "Array of phone numbers with country code",
              example: '["5511999999999", "5511888888888"]',
            },
          ],
        },
        responseExample: JSON.stringify(
          [
            {
              exists: true,
              jid: "5511999999999@s.whatsapp.net",
              number: "5511999999999",
            },
            {
              exists: false,
              jid: "",
              number: "5511888888888",
            },
          ],
          null,
          2,
        ),
        curlExample: `curl -X POST http://localhost:8090/api/proxy/{wid}/instance/{iid}/chat/check-number \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"numbers": ["5511999999999", "5511888888888"]}'`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance/{iid}/chat/check-number", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    numbers: ["5511999999999", "5511888888888"],
  }),
});
const results = await res.json();`,
      },
    ],
  },
];
