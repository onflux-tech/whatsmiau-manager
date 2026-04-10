import { Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import pb from "@/lib/pocketbase";
import { detectResourceType } from "./playground-utils";
import { usePlaygroundAuth } from "./use-playground-auth";

interface ResourceOption {
  id: string;
  label: string;
  group?: string;
  status?: "open" | "closed" | "connecting" | "qr-code";
}

interface ResourceSelectProps {
  endpointPath: string;
  paramName: string;
  value: string;
  onChange: (value: string) => void;
  parentParams?: Record<string, string>;
  className?: string;
}

const cache = new Map<string, { data: ResourceOption[]; ts: number }>();
const CACHE_TTL = 60_000;

function getCached(key: string): ResourceOption[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

async function fetchResources(
  resourceType: string,
  authHeaders: Record<string, string>,
  wid?: string,
): Promise<ResourceOption[]> {
  const base = window.location.origin;

  if (resourceType === "workspaces") {
    const url = new URL("/api/collections/workspaces/records", base);
    url.searchParams.set("perPage", "100");
    url.searchParams.set("fields", "id,name");
    const token = pb.authStore.token;
    if (!token) return [];
    const res = await fetch(url.toString(), {
      headers: { Authorization: token },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const items = (json.items ?? []) as Record<string, unknown>[];
    return items.map((item) => ({
      id: (item.id as string) ?? "",
      label: (item.name as string) ?? (item.id as string) ?? "",
    }));
  }

  if (resourceType === "instances" && wid) {
    const url = new URL(`/api/proxy/${wid}/instance`, base);
    const res = await fetch(url.toString(), { headers: authHeaders });
    if (!res.ok) return [];
    const items = (await res.json()) as Record<string, unknown>[];
    return items.map((item) => ({
      id: (item.id as string) ?? "",
      label: (item.name as string) ?? (item.id as string) ?? "",
      status: (item.status as ResourceOption["status"]) ?? undefined,
    }));
  }

  return [];
}

function StatusDot({ status }: { status?: ResourceOption["status"] }) {
  if (!status) return null;
  const color = status === "open" ? "bg-green-400" : "bg-red-400/70";
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />;
}

export function ResourceSelect({
  endpointPath,
  paramName,
  value,
  onChange,
  parentParams,
  className,
}: ResourceSelectProps) {
  const { isAuthorized, authHeaders } = usePlaygroundAuth();
  const [options, setOptions] = useState<ResourceOption[]>([]);
  const [loading, setLoading] = useState(false);
  const lastFetchKey = useRef("");

  const resourceType = detectResourceType(endpointPath, paramName);
  const wid = parentParams?.wid;

  const handleOpen = useCallback(
    async (open: boolean) => {
      if (!open || !isAuthorized || !resourceType) return;

      const fetchKey = `${resourceType}:${wid ?? ""}`;
      if (fetchKey === lastFetchKey.current && options.length > 0) return;
      lastFetchKey.current = fetchKey;

      if (resourceType === "instances" && !wid) return;

      const cacheKey = `${resourceType}:${paramName}:${wid ?? ""}`;
      const cached = getCached(cacheKey);
      if (cached) {
        setOptions(cached);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchResources(resourceType, authHeaders, wid);
        cache.set(cacheKey, { data, ts: Date.now() });
        setOptions(data);
      } catch {
        // silently fail — user can type manually
      } finally {
        setLoading(false);
      }
    },
    [authHeaders, isAuthorized, resourceType, paramName, wid, options.length],
  );

  if (!isAuthorized || !resourceType) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={!isAuthorized ? `${paramName} — authorize to browse` : `Enter ${paramName}`}
        className={className}
      />
    );
  }

  const grouped = new Map<string, ResourceOption[]>();
  for (const opt of options) {
    const key = opt.group ?? "";
    const arr = grouped.get(key) ?? [];
    arr.push(opt);
    grouped.set(key, arr);
  }

  return (
    <Select value={value} onValueChange={onChange} onOpenChange={handleOpen}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={`Select ${paramName}...`} />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-64">
        {loading && (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && options.length === 0 && (
          <div className="px-2 py-3 text-center text-xs text-muted-foreground">
            No resources found
          </div>
        )}
        {!loading &&
          [...grouped.entries()].map(([group, items]) =>
            group ? (
              <SelectGroup key={group}>
                <SelectLabel>{group}</SelectLabel>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    <StatusDot status={item.status} />
                    <span className="truncate">{item.label}</span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                      {item.id.slice(0, 8)}
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            ) : (
              items.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <StatusDot status={item.status} />
                  <span className="truncate">{item.label}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    {item.id.slice(0, 8)}
                  </span>
                </SelectItem>
              ))
            ),
          )}
      </SelectContent>
    </Select>
  );
}
