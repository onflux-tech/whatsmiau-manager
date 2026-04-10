import {
  ChevronDown,
  ChevronRight,
  Copy,
  Loader2,
  Minus,
  Play,
  Plus,
  Square,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ApiEndpoint, HttpMethod } from "../types";
import { highlightJSON } from "./json-highlight";
import {
  buildRequestUrl,
  formatBytes,
  generateBodyTemplate,
  generateCurl,
  generateJsSnippet,
  MAX_DISPLAY_BYTES,
  METHOD_STYLE,
  parsePathParams,
  statusColor,
} from "./playground-utils";
import { ResourceSelect } from "./resource-select";
import { StreamingViewer } from "./streaming-viewer";
import { usePlaygroundAuth } from "./use-playground-auth";

export interface HistoryEntry {
  id: string;
  method: HttpMethod;
  path: string;
  title: string;
  status: number;
  duration: number;
  timestamp: number;
}

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function KVEditor({
  rows,
  onChange,
}: {
  rows: { key: string; value: string }[];
  onChange: (rows: { key: string; value: string }[]) => void;
}) {
  const update = (i: number, field: "key" | "value", val: string) => {
    const next = [...rows];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  const addRow = () => onChange([...rows, { key: "", value: "" }]);
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-1.5">
      {rows.map((row, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: dynamic rows without stable IDs
        <div key={i} className="flex items-center gap-1.5">
          <Input
            value={row.key}
            onChange={(e) => update(i, "key", e.target.value)}
            placeholder="key"
            className="h-7 flex-1 font-mono text-xs"
          />
          <Input
            value={row.value}
            onChange={(e) => update(i, "value", e.target.value)}
            placeholder="value"
            className="h-7 flex-1 font-mono text-xs"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => removeRow(i)}
            className="h-7 w-7 shrink-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={addRow} className="h-7 text-xs">
        <Plus className="mr-1 h-3 w-3" /> Add
      </Button>
    </div>
  );
}

interface PlaygroundSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpoint: ApiEndpoint | null;
  onHistory?: (entry: HistoryEntry) => void;
}

interface ResponseState {
  status: number;
  statusText: string;
  headers: [string, string][];
  body: string;
  duration: number;
  size: number;
  truncated: boolean;
}

export function PlaygroundSheet({ open, onOpenChange, endpoint, onHistory }: PlaygroundSheetProps) {
  const { isAuthorized, authHeaders: playgroundAuthHeaders } = usePlaygroundAuth();

  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([]);
  const [queryParams, setQueryParams] = useState<{ key: string; value: string }[]>([]);
  const [body, setBody] = useState("");

  const [response, setResponse] = useState<ResponseState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!endpoint) return;

    const params: Record<string, string> = {};
    for (const p of parsePathParams(endpoint.path)) {
      params[p] = "";
    }
    setPathParams(params);

    setHeaders([{ key: "Accept", value: "*/*" }]);

    const qp =
      endpoint.queryParams?.map((p) => ({
        key: p.name,
        value: p.example ?? "",
      })) ?? [];
    setQueryParams(qp);

    setBody(endpoint.requestBody ? generateBodyTemplate(endpoint.requestBody.fields) : "");

    setResponse(null);
    setError(null);
  }, [endpoint]);

  const sendRequest = useCallback(async () => {
    if (!endpoint) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setResponse(null);

    const origin = window.location.origin;
    const qpObj: Record<string, string> = {};
    for (const { key, value } of queryParams) {
      if (key && value) qpObj[key] = value;
    }
    const url = buildRequestUrl(origin, endpoint.path, pathParams, qpObj);

    const reqHeaders: Record<string, string> = { ...playgroundAuthHeaders };
    for (const { key, value } of headers) {
      if (key && value) reqHeaders[key] = value;
    }

    const hasBody = body.trim() && endpoint.method !== "GET" && endpoint.method !== "DELETE";

    if (hasBody) {
      reqHeaders["Content-Type"] = "application/json";
    }

    const t0 = performance.now();

    try {
      const res = await fetch(url, {
        method: endpoint.method,
        headers: reqHeaders,
        body: hasBody ? body : undefined,
        signal: controller.signal,
      });

      const duration = Math.round(performance.now() - t0);

      const resHeaders: [string, string][] = [];
      res.headers.forEach((value, key) => {
        resHeaders.push([key, value]);
      });

      const raw = await res.text();
      const size = new Blob([raw]).size;
      const truncated = size > MAX_DISPLAY_BYTES;
      const displayBody = truncated ? raw.slice(0, MAX_DISPLAY_BYTES) : raw;

      let prettyBody = displayBody;
      try {
        const parsed = JSON.parse(displayBody);
        prettyBody = JSON.stringify(parsed, null, 2);
      } catch {
        // not JSON, show raw
      }

      const resState: ResponseState = {
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
        body: prettyBody,
        duration,
        size,
        truncated,
      };
      setResponse(resState);

      onHistory?.({
        id: crypto.randomUUID(),
        method: endpoint.method,
        path: endpoint.path,
        title: endpoint.title,
        status: res.status,
        duration,
        timestamp: Date.now(),
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Could not connect");
    } finally {
      setLoading(false);
    }
  }, [endpoint, pathParams, queryParams, headers, body, playgroundAuthHeaders, onHistory]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        sendRequest();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, sendRequest]);

  useEffect(() => {
    if (!open) abortRef.current?.abort();
  }, [open]);

  if (!endpoint) return null;

  const pathParamNames = parsePathParams(endpoint.path);
  const isStreaming = !!endpoint.streaming;
  const origin = window.location.origin;

  const qpObj: Record<string, string> = {};
  for (const { key, value } of queryParams) {
    if (key && value) qpObj[key] = value;
  }
  const liveUrl = buildRequestUrl(origin, endpoint.path, pathParams, qpObj);

  const codeHeaders: Record<string, string> = { ...playgroundAuthHeaders };
  for (const { key, value } of headers) {
    if (key && value) codeHeaders[key] = value;
  }
  const hasBody = body.trim() && endpoint.method !== "GET" && endpoint.method !== "DELETE";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full gap-0 p-0 sm:max-w-none lg:w-[90vw] xl:w-[calc(100vw-272px)]"
      >
        <SheetTitle className="sr-only">API Playground — {endpoint.title}</SheetTitle>
        <SheetDescription className="sr-only">
          Test the {endpoint.method} {endpoint.path} endpoint
        </SheetDescription>

        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <Badge
            variant="outline"
            className={cn("shrink-0 font-mono text-xs font-bold", METHOD_STYLE[endpoint.method])}
          >
            {endpoint.method}
          </Badge>

          <code className="truncate text-xs text-muted-foreground">{liveUrl}</code>

          <div className="flex-1" />

          {loading ? (
            <Button size="sm" variant="destructive" onClick={() => abortRef.current?.abort()}>
              <Square className="mr-1.5 h-3.5 w-3.5" /> Cancel
            </Button>
          ) : (
            <Button size="sm" onClick={sendRequest} disabled={isStreaming && !isAuthorized}>
              <Play className="mr-1.5 h-3.5 w-3.5" />
              Send
              <kbd className="ml-2 hidden rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                Ctrl+Enter
              </kbd>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="flex-1 overflow-y-auto border-b border-border p-4 lg:border-b-0 lg:border-r">
            {pathParamNames.length > 0 && (
              <Section title="Path Parameters">
                <div className="space-y-2">
                  {pathParamNames.map((name) => (
                    <div key={name} className="space-y-1">
                      <label
                        className="text-xs font-medium"
                        htmlFor={`path-param-${name}`}
                      >{`{${name}}`}</label>
                      <ResourceSelect
                        endpointPath={endpoint.path}
                        paramName={name}
                        value={pathParams[name] ?? ""}
                        onChange={(v) => setPathParams((prev) => ({ ...prev, [name]: v }))}
                        parentParams={pathParams}
                        className="h-8"
                      />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Authentication" defaultOpen={!isAuthorized}>
              {isAuthorized ? (
                <div className="flex items-center gap-2 rounded-lg border border-green-400/30 bg-green-400/5 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-xs text-green-400">Session active</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Not authenticated. Please log in to test endpoints.
                </p>
              )}
            </Section>

            <Section title="Headers">
              <KVEditor rows={headers} onChange={setHeaders} />
            </Section>

            {(queryParams.length > 0 ||
              (endpoint.queryParams && endpoint.queryParams.length > 0)) && (
              <Section title="Query Parameters">
                <KVEditor rows={queryParams} onChange={setQueryParams} />
              </Section>
            )}

            {endpoint.requestBody && endpoint.method !== "GET" && endpoint.method !== "DELETE" && (
              <Section title="Request Body">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="h-40 w-full resize-y rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  spellCheck={false}
                />
              </Section>
            )}

            <Section title="Code Snippet" defaultOpen={false}>
              <Tabs defaultValue="curl">
                <TabsList className="h-8">
                  <TabsTrigger value="curl" className="text-xs">
                    cURL
                  </TabsTrigger>
                  <TabsTrigger value="js" className="text-xs">
                    JavaScript
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="curl" className="mt-2">
                  <CodeSnippetBlock
                    code={generateCurl(
                      endpoint.method,
                      liveUrl,
                      codeHeaders,
                      hasBody ? body : undefined,
                    )}
                  />
                </TabsContent>
                <TabsContent value="js" className="mt-2">
                  <CodeSnippetBlock
                    code={generateJsSnippet(
                      endpoint.method,
                      liveUrl,
                      codeHeaders,
                      hasBody ? body : undefined,
                    )}
                  />
                </TabsContent>
              </Tabs>
            </Section>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Response
            </h4>

            {isStreaming && open && (
              <StreamingViewer
                endpoint={endpoint}
                authHeaders={playgroundAuthHeaders}
                pathParams={pathParams}
                queryParams={qpObj}
                onHistory={onHistory}
              />
            )}

            {loading && !isStreaming && (
              <div className="flex items-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Sending request...</span>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-400/30 bg-red-400/5 p-4">
                <p className="text-sm font-medium text-red-400">Could not connect</p>
                <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{liveUrl}</p>
              </div>
            )}

            {response && !isStreaming && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn("font-mono text-xs font-bold", statusColor(response.status))}
                  >
                    {response.status} {response.statusText}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{response.duration}ms</span>
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(response.size)}
                  </span>

                  {response.status === 401 && (
                    <span className="text-xs text-amber-400">— Not authenticated</span>
                  )}
                </div>

                {response.truncated && (
                  <p className="text-xs text-amber-400">
                    Response truncated to {formatBytes(MAX_DISPLAY_BYTES)} (total:{" "}
                    {formatBytes(response.size)})
                  </p>
                )}

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-2"
                    onClick={() => navigator.clipboard.writeText(response.body)}
                    aria-label="Copy response"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <pre className="max-h-96 overflow-auto rounded-lg bg-muted/50 p-3 text-xs font-mono leading-relaxed">
                    <code>{highlightJSON(response.body)}</code>
                  </pre>
                </div>

                <Section title="Response Headers" defaultOpen={false}>
                  <div className="space-y-1">
                    {response.headers.map(([k, v]) => (
                      <div key={k} className="flex gap-2 text-xs">
                        <span className="font-mono font-medium text-blue-400">{k}:</span>
                        <span className="break-all font-mono text-muted-foreground">{v}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {!loading && !error && !response && !isStreaming && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Play className="mb-3 h-8 w-8 opacity-30" />
                <p className="text-sm">Click Send to test this endpoint</p>
                <p className="mt-1 text-xs opacity-60">or press Ctrl+Enter</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CodeSnippetBlock({ code }: { code: string }) {
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute right-2 top-2"
        onClick={() => navigator.clipboard.writeText(code)}
        aria-label="Copy code"
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
      <pre className="overflow-auto rounded-lg bg-muted/50 p-3 pr-10 text-xs font-mono leading-relaxed text-muted-foreground">
        {code}
      </pre>
    </div>
  );
}
