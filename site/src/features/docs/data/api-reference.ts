import { Globe, Link, MessageSquare, MonitorSmartphone, Radio, Webhook } from "lucide-react";
import type { ApiGroup } from "../types";

export const apiGroups: ApiGroup[] = [
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
              name: "id",
              type: "string",
              required: true,
              description: "Unique instance identifier (slug-friendly)",
              example: "my-instance",
            },
            {
              name: "name",
              type: "string",
              required: false,
              description: "Display name for the instance",
              example: "Production WhatsApp",
            },
          ],
        },
        responseExample: JSON.stringify(
          { id: "my-instance", name: "Production WhatsApp", status: "closed" },
          null,
          2,
        ),
        curlExample: `curl -X POST http://localhost:8090/api/proxy/{wid}/instance \\
  -H "Authorization: YOUR_PB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"id": "my-instance", "name": "Production WhatsApp"}'`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/instance", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: "my-instance",
    name: "Production WhatsApp",
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
          "Creates or updates the webhook configuration for an instance. Set the URL, enable/disable, and choose which events to subscribe to.",
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
              name: "url",
              type: "string",
              required: true,
              description: "Webhook delivery URL",
              example: "https://example.com/webhook",
            },
            {
              name: "enabled",
              type: "boolean",
              required: false,
              description: "Enable or disable the webhook",
              example: "true",
            },
            {
              name: "events",
              type: "string[]",
              required: false,
              description: "List of event types to subscribe to",
              example: '["messages", "status"]',
            },
            {
              name: "byEvents",
              type: "boolean",
              required: false,
              description: "If true, sends events to separate sub-paths by event type",
              example: "false",
            },
            {
              name: "base64",
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
  -d '{"url": "https://example.com/webhook", "enabled": true}'`,
        jsExample: `const res = await fetch("/api/proxy/{wid}/webhook/{iid}", {
  method: "POST",
  headers: {
    Authorization: pb.authStore.token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://example.com/webhook",
    enabled: true,
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
    ],
  },
  {
    id: "chat",
    title: "Chat",
    description:
      "Chat-level actions like sending typing indicators (composing, recording audio) to contacts.",
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
        responseExample: JSON.stringify({ status: "PENDING" }, null, 2),
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
    ],
  },
];
