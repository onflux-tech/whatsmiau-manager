import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CodeBlock } from "./code-block";

export function GettingStarted() {
  return (
    <section id="getting-started" className="scroll-mt-24">
      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-bold">Getting Started</h2>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          The WhatsMiau Manager API provides a secure proxy layer for managing WhatsApp instances
          across multiple workspaces. All instance-related endpoints are workspace-scoped through
          the{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            /api/proxy/{"{wid}"}/...
          </code>{" "}
          pattern, where the Manager injects the workspace&apos;s API key before forwarding to the
          WhatsMiau API.
        </p>
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <code className="text-sm font-mono text-muted-foreground">
            Base URL: http://localhost:8090/api/proxy/{"{wid}"}/
          </code>
        </div>
      </div>

      <div id="auth-session" className="mb-12 scroll-mt-24">
        <h3 className="mb-3 text-lg font-bold">Authentication</h3>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          All API requests require a PocketBase authentication token. Authenticate with the
          superuser credentials via the PocketBase auth endpoint, then include the token in the{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">Authorization</code>{" "}
          header of subsequent requests.
        </p>
        <CodeBlock
          curlCode={`curl -X POST http://localhost:8090/api/collections/_superusers/auth-with-password \\
  -H "Content-Type: application/json" \\
  -d '{"identity": "admin@example.com", "password": "your-password"}'

# Then use the token:
curl http://localhost:8090/api/proxy/{wid}/instance \\
  -H "Authorization: YOUR_PB_TOKEN"`}
          jsCode={`import PocketBase from "pocketbase";

const pb = new PocketBase("http://localhost:8090");

// Login
await pb.collection("_superusers")
  .authWithPassword("admin@example.com", "your-password");

// Then use the token — it's automatically managed by the SDK
const res = await fetch(\`/api/proxy/\${wid}/instance\`, {
  headers: { Authorization: pb.authStore.token },
});
const instances = await res.json();`}
        />
      </div>

      <div id="proxy-pattern" className="mb-12 scroll-mt-24">
        <h3 className="mb-3 text-lg font-bold">Proxy Architecture</h3>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          The Manager acts as a reverse proxy between clients and the WhatsMiau API. When you call{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            /api/proxy/{"{wid}"}/instance
          </code>
          , the Manager:
        </p>
        <ol className="mb-4 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
          <li>Validates your PocketBase authentication token</li>
          <li>Looks up the workspace URL and API key from the database</li>
          <li>
            Forwards the request to{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {"{workspace_url}"}/v1/instance
            </code>
          </li>
          <li>
            Injects the{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">apikey</code> header
            automatically
          </li>
          <li>Returns the upstream response to the client</li>
        </ol>
        <div className="flex items-center gap-2 rounded-lg border border-green-400/30 bg-green-400/5 px-3 py-2.5">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-xs text-green-400">
            API keys never leave the server - they are stored in PocketBase and injected
            server-side.
          </span>
        </div>
      </div>

      <div id="response-format" className="mb-12 scroll-mt-24">
        <h3 className="mb-3 text-lg font-bold">Response Format</h3>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          Responses use JSON. The proxy forwards the upstream response as-is, preserving status
          codes and content types. Some Manager-specific endpoints return standardized formats.
        </p>
        <div className="space-y-3">
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Proxy Error Responses
            </h4>
            <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3 text-xs font-mono leading-relaxed text-muted-foreground">
              <code>{`// 502 — WhatsMiau API unreachable
{ "message": "bad_gateway: could not reach upstream API" }

// 503 — API key rejected by WhatsMiau
{ "message": "auth_error: API key rejected by upstream" }`}</code>
            </pre>
          </div>
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Common Status Codes
            </h4>
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Code</TableHead>
                    <TableHead className="text-xs">Meaning</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["200", "Success"],
                    ["201", "Created"],
                    ["401", "Unauthorized — missing or invalid PocketBase token"],
                    ["404", "Workspace or resource not found"],
                    ["502", "Bad gateway — WhatsMiau API unreachable"],
                    ["503", "API key rejected by upstream"],
                  ].map(([code, desc]) => (
                    <TableRow key={code}>
                      <TableCell className="text-xs font-mono font-semibold">{code}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <div id="workspaces" className="mb-12 scroll-mt-24">
        <h3 className="mb-3 text-lg font-bold">Workspaces</h3>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          A workspace represents a connection to a WhatsMiau API instance. Each workspace has its
          own URL, API key, and set of WhatsApp instances. Use the{" "}
          <Badge variant="outline" className="font-mono text-[10px]">
            wid
          </Badge>{" "}
          parameter in proxy endpoints to specify which workspace to target.
        </p>
        <p className="text-sm text-muted-foreground">
          Workspaces are managed through the{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            Workspace Management
          </code>{" "}
          endpoints documented below. On creation, the Manager immediately polls the WhatsMiau API
          for instance data. On deletion, all associated health checks and snapshots are cascade
          deleted.
        </p>
      </div>
    </section>
  );
}
