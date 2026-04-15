import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
      }),
    enabled: !!safeWid,
    refetchInterval: 60_000,
  });

  useRealtime("instance_snapshots", ["instance-snapshots", wid]);

  const total = snapshots.length;
  const connected = snapshots.filter((s) => s.status === "open").length;
  const disconnected = snapshots.filter((s) => s.status === "closed").length;
  const qrPending = snapshots.filter(
    (s) => s.status === "qr-code" || s.status === "connecting",
  ).length;

  const latest = healthHistory[0];
  const latencyData = healthHistory
    .slice(0, 100)
    .reverse()
    .map((h) => h.latency_ms);

  const isUp = latest?.status === "up";
  const uptimePercent =
    healthHistory.length > 0
      ? Math.round(
          (healthHistory.filter((h) => h.status === "up").length / healthHistory.length) * 100,
        )
      : null;

  return (
    <div className="grid grid-cols-2 gap-2 px-3 py-2 md:grid-cols-5 md:gap-3">
      <StatCard label="Instâncias" value={total} tooltip="Total de instâncias registradas" />
      <StatCard
        label="Conectadas"
        value={connected}
        variant="success"
        tooltip="Instâncias com sessão WhatsApp ativa"
      />
      <StatCard
        label="Desconectadas"
        value={disconnected}
        variant={disconnected > 0 ? "destructive" : undefined}
        tooltip="Instâncias sem sessão ativa"
      />
      <StatCard
        label="Pendentes"
        value={qrPending}
        variant={qrPending > 0 ? "warning" : undefined}
        tooltip="Aguardando QR Code ou pareamento"
      />
      <div className="glass flex items-center justify-between rounded-lg border p-3 col-span-2 md:col-span-1">
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
          {uptimePercent !== null && (
            <span className="mt-0.5 text-[10px] text-muted-foreground">
              Uptime {uptimePercent}%
            </span>
          )}
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
  tooltip,
}: {
  label: string;
  value: number;
  variant?: "success" | "warning" | "destructive";
  tooltip?: string;
}) {
  const content = (
    <div className="glass flex flex-col rounded-lg border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-lg font-bold",
          variant === "success" && "text-success",
          variant === "warning" && "text-warning",
          variant === "destructive" && "text-destructive",
        )}
      >
        {value}
      </span>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
