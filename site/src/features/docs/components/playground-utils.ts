import type { ApiEndpoint, ApiParameter, HttpMethod } from "../types";

export const METHOD_STYLE: Record<HttpMethod, string> = {
  GET: "border-blue-400/30 text-blue-400 bg-blue-400/10",
  POST: "border-green-400/30 text-green-400 bg-green-400/10",
  PUT: "border-amber-400/30 text-amber-400 bg-amber-400/10",
  DELETE: "border-red-400/30 text-red-400 bg-red-400/10",
};

/** Extract parameter names from a path template, e.g. "/api/proxy/{wid}/instance" → ["wid"] */
export function parsePathParams(path: string): string[] {
  const matches = path.matchAll(/\{(\w+)\}/g);
  return [...matches].map((m) => m[1]);
}

/** Replace {param} placeholders with actual values */
function resolvePath(path: string, params: Record<string, string>): string {
  return path.replace(/\{(\w+)\}/g, (_, key) => params[key] || `{${key}}`);
}

export function buildRequestUrl(
  origin: string,
  path: string,
  pathParams: Record<string, string>,
  queryParams: Record<string, string>,
): string {
  const resolved = resolvePath(path, pathParams);
  const url = new URL(resolved, origin);

  for (const [key, value] of Object.entries(queryParams)) {
    if (value) url.searchParams.set(key, value);
  }

  return url.toString();
}

function defaultForType(type: string): unknown {
  const t = type.toLowerCase();
  if (t === "number" || t === "integer" || t === "int") return 0;
  if (t === "boolean" || t === "bool") return false;
  if (t.startsWith("array") || t.startsWith("[]") || t.endsWith("[]")) return [];
  if (t === "object") return {};
  return "";
}

function isCompoundType(type: string): boolean {
  const t = type.toLowerCase();
  return t === "object" || t.endsWith("[]") || t.startsWith("array") || t.startsWith("[]");
}

function coerceExample(example: string, type: string): unknown {
  const t = type.toLowerCase();
  if (t === "number" || t === "integer" || t === "int") {
    const n = Number(example);
    return Number.isNaN(n) ? example : n;
  }
  if (t === "boolean" || t === "bool") {
    return example === "true";
  }
  return example;
}

export function generateBodyTemplate(fields: ApiParameter[]): string {
  const obj: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.example != null && isCompoundType(f.type)) {
      try {
        obj[f.name] = JSON.parse(f.example);
      } catch {
        obj[f.name] = f.example;
      }
    } else if (f.example != null) {
      obj[f.name] = coerceExample(f.example, f.type);
    } else {
      obj[f.name] = defaultForType(f.type);
    }
  }
  return JSON.stringify(obj, null, 2);
}

export function generateCurl(
  method: HttpMethod,
  url: string,
  headers: Record<string, string>,
  body?: string,
): string {
  const parts: string[] = ["curl"];

  if (method !== "GET") {
    parts.push(`-X ${method}`);
  }

  parts.push(`'${url}'`);

  for (const [key, value] of Object.entries(headers)) {
    if (value) parts.push(`\\\n  -H '${key}: ${value}'`);
  }

  if (body && method !== "GET" && method !== "DELETE") {
    parts.push(`\\\n  -d '${body}'`);
  }

  return parts.join(" ");
}

export function generateJsSnippet(
  method: HttpMethod,
  url: string,
  headers: Record<string, string>,
  body?: string,
): string {
  const opts: string[] = [];

  if (method !== "GET") {
    opts.push(`  method: "${method}",`);
  }

  const hdr: string[] = [];
  for (const [key, value] of Object.entries(headers)) {
    if (value) hdr.push(`    "${key}": "${value}",`);
  }
  if (hdr.length > 0) {
    opts.push(`  headers: {\n${hdr.join("\n")}\n  },`);
  }

  if (body && method !== "GET" && method !== "DELETE") {
    opts.push(`  body: JSON.stringify(${body}),`);
  }

  if (opts.length === 0) {
    return `const res = await fetch("${url}");\nconst data = await res.json();`;
  }

  return `const res = await fetch("${url}", {\n${opts.join("\n")}\n});\nconst data = await res.json();`;
}

export function isQuickEligible(endpoint: ApiEndpoint): boolean {
  return (
    !endpoint.streaming &&
    !endpoint.websocket &&
    !endpoint.requestBody &&
    (endpoint.parameters?.length ?? 0) <= 1
  );
}

const PARAM_RESOURCE_MAP: Record<string, string> = {
  wid: "workspaces",
  iid: "instances",
};

export function detectResourceType(_path: string, paramName?: string): string | null {
  if (paramName && PARAM_RESOURCE_MAP[paramName]) {
    return PARAM_RESOURCE_MAP[paramName];
  }
  return null;
}

export function statusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-green-400 border-green-400/30 bg-green-400/10";
  if (status >= 300 && status < 400) return "text-blue-400 border-blue-400/30 bg-blue-400/10";
  if (status >= 400 && status < 500) return "text-amber-400 border-amber-400/30 bg-amber-400/10";
  return "text-red-400 border-red-400/30 bg-red-400/10";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const MAX_DISPLAY_BYTES = 100 * 1024;
