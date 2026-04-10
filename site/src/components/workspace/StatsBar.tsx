import { useQuery } from "@tanstack/react-query";
import { useRealtime } from "@/hooks/useRealtime";
import pb from "@/lib/pocketbase";
import type { HealthCheck, InstanceSnapshot } from "@/lib/types";
import { cn, sanitizeId } from "@/lib/utils";
import { Sparkline } from "./Sparkline";

export function StatsBar({ wid }: { wid: string }) {
  const safeWid = sanitizeId(wid);

  const { data: snapshots = [] } = useQuery({
    queryKey: ["instance-snapshots", wid],
    queryFn: () =>
      pb.collection("instance_snapshots").getFullList<InstanceSnapshot>({
        filter: `workspace = "${safeWid}"`,
        sort: "name",
      }),
    enabled: !!safeWid,
  });

  const { data: healthHistory = [] } = useQuery({
    queryKey: ["health-history", wid],
    queryFn: () =>
      pb.collection("health_checks").getFullList<HealthCheck>({
        filter: `workspace = "${safeWid}"`,
        sort: "-created",
        // last 288 records = ~24h at 5min intervals
      }),
    enabled: !!safeWid,
    refetchInterval: 60_000,
  });

  useRealtime("instance_snapshots", ["instance-snapshots", wid]);

  const total = snapshots.length;
  const connected = snapshots.filter((s) => s.status === "open").length;
  const qrPending = snapshots.filter(
    (s) => s.status === "qr-code" || s.status === "connecting",
  ).length;

  const latest = healthHistory[0];
  const latencyData = healthHistory
    .slice(0, 100)
    .reverse()
    .map((h) => h.latency_ms);

  const isUp = latest?.status === "up";

  return (
    <div className="grid grid-cols-2 gap-2 px-3 py-2 md:grid-cols-4 md:gap-3">
      <StatCard label="Instâncias" value={total} />
      <StatCard label="Conectadas" value={connected} variant="success" />
      <StatCard
        label="Pendentes"
        value={qrPending}
        variant={qrPending > 0 ? "warning" : undefined}
      />
      <div className="glass flex items-center justify-between rounded-lg border p-3">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Latência</span>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isUp ? "bg-success" : latest ? "bg-destructive" : "bg-muted-foreground",
              )}
            />
            <span className="text-sm font-semibold">{latest ? `${latest.latency_ms}ms` : "—"}</span>
            <span className={cn("text-xs font-medium", isUp ? "text-success" : "text-destructive")}>
              {latest ? (isUp ? "UP" : "DOWN") : ""}
            </span>
          </div>
        </div>
        {latencyData.length > 1 && <Sparkline data={latencyData} className="text-primary" />}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant?: "success" | "warning";
}) {
  return (
    <div className="glass flex flex-col rounded-lg border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-lg font-bold",
          variant === "success" && "text-success",
          variant === "warning" && "text-warning",
        )}
      >
        {value}
      </span>
    </div>
  );
}
