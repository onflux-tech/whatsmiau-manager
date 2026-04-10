import { Play, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ApiEndpoint, ApiParameter, AuthType } from "../types";
import { CodeBlock } from "./code-block";
import { isQuickEligible, METHOD_STYLE } from "./playground-utils";
import { QuickSendBar } from "./quick-send-bar";

const AUTH_LABEL: Record<AuthType, { text: string; className: string }> = {
  required: { text: "Auth Required", className: "border-amber-400/30 text-amber-400" },
  public: { text: "Public", className: "border-green-400/30 text-green-400" },
};

function ParamRow({ param }: { param: ApiParameter }) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-mono font-semibold">{param.name}</span>
        <span className="text-xs font-mono text-muted-foreground">{param.type}</span>
        {param.required ? (
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
            required
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            optional
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{param.description}</p>
    </div>
  );
}

function ParamList({ title, params }: { title: string; params: ApiParameter[] }) {
  if (params.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </h4>
      <div className="divide-y divide-border">
        {params.map((p) => (
          <ParamRow key={p.name} param={p} />
        ))}
      </div>
    </div>
  );
}

interface EndpointSectionProps {
  endpoint: ApiEndpoint;
  onOpenPlayground?: (endpoint: ApiEndpoint) => void;
}

export function EndpointSection({ endpoint, onOpenPlayground }: EndpointSectionProps) {
  const authInfo = AUTH_LABEL[endpoint.auth];

  return (
    <section id={endpoint.id} className="scroll-mt-28 pt-4">
      <div className="flex flex-col gap-8 xl:flex-row xl:gap-12">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-3">
            <Badge
              variant="outline"
              className={cn("text-xs font-mono font-bold", METHOD_STYLE[endpoint.method])}
            >
              {endpoint.method}
            </Badge>
            <h3 className="text-lg font-bold">{endpoint.title}</h3>
            {endpoint.streaming && (
              <Badge variant="outline" className="border-purple-400/30 text-[10px] text-purple-400">
                <Radio className="mr-1 h-2.5 w-2.5" /> SSE
              </Badge>
            )}
            {!endpoint.websocket && onOpenPlayground && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto h-7 text-xs"
                onClick={() => onOpenPlayground(endpoint)}
              >
                <Play className="mr-1 h-3 w-3" />
                Test Request
              </Button>
            )}
          </div>

          <div className="mb-4 rounded-lg bg-muted/50 px-3 py-2">
            <code className="text-sm font-mono text-muted-foreground">{endpoint.path}</code>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            {endpoint.description}
          </p>

          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Auth
            </span>
            <Badge variant="outline" className={cn("text-xs", authInfo.className)}>
              {authInfo.text}
            </Badge>
          </div>

          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <ParamList title="URL Parameters" params={endpoint.parameters} />
          )}

          {endpoint.queryParams && endpoint.queryParams.length > 0 && (
            <ParamList title="Query Parameters" params={endpoint.queryParams} />
          )}

          {endpoint.requestBody && endpoint.requestBody.fields.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Request Body
              </h4>
              <p className="mb-2 text-xs text-muted-foreground">
                {endpoint.requestBody.contentType}
              </p>
              <div className="divide-y divide-border">
                {endpoint.requestBody.fields.map((f) => (
                  <ParamRow key={f.name} param={f} />
                ))}
              </div>
            </div>
          )}

          {endpoint.responseExample && (
            <div className="mt-6">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Response
              </h4>
              <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3 text-xs font-mono leading-relaxed text-muted-foreground">
                <code>{endpoint.responseExample}</code>
              </pre>
            </div>
          )}

          {isQuickEligible(endpoint) && (
            <QuickSendBar
              endpoint={endpoint}
              onOpenPlayground={() => onOpenPlayground?.(endpoint)}
            />
          )}
        </div>

        <div className="flex-1 xl:max-w-xl">
          <div className="xl:sticky xl:top-24">
            <CodeBlock curlCode={endpoint.curlExample} jsCode={endpoint.jsExample} />
          </div>
        </div>
      </div>
    </section>
  );
}
