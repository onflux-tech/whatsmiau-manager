import { Activity, Wifi, WifiOff, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { WorkspaceAvatar } from "@/features/workspace/components/WorkspaceAvatar";
import { cn } from "@/lib/utils";
import type { WorkspaceSummary } from "../hooks/useDashboardData";

const STATUS_COLOR: Record<string, string> = {
  up: "bg-success",
  down: "bg-destructive",
  auth_error: "bg-warning",
};

const STATUS_LABEL: Record<string, string> = {
  up: "Online",
  down: "Offline",
  auth_error: "Auth Error",
};

interface WorkspaceCardProps {
  summary: WorkspaceSummary;
}

export function WorkspaceCard({ summary }: WorkspaceCardProps) {
  const navigate = useNavigate();
  const { workspace, health, connected, disconnected, pending, total, uptimePercent } = summary;

  const statusColor = health?.status
    ? (STATUS_COLOR[health.status] ?? "bg-muted-foreground")
    : "bg-muted-foreground";

  const statusLabel = health?.status
    ? (STATUS_LABEL[health.status] ?? "Desconhecido")
    : "Sem dados";

  const hasAlerts =
    disconnected > 0 || health?.status === "down" || health?.status === "auth_error";

  return (
    <button
      type="button"
      onClick={() => navigate(`/w/${workspace.id}`)}
      className={cn(
        "glass group relative flex flex-col rounded-xl border p-4 text-left transition-all duration-200",
        "hover:border-primary/40 hover:shadow-[0_0_20px_rgba(0,189,176,0.10)]",
        hasAlerts && "border-destructive/20 hover:border-destructive/40",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <WorkspaceAvatar workspace={workspace} size="lg" />
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full transition-opacity",
                statusColor,
              )}
            />
          </TooltipTrigger>
          <TooltipContent>{statusLabel}</TooltipContent>
        </Tooltip>
      </div>

      {/* Name */}
      <h3 className="mt-3 truncate text-sm font-semibold">{workspace.name}</h3>

      {/* Metrics row */}
      <div className="mt-3 flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-xs text-success">
              <Wifi className="size-3.5 shrink-0" />
              <span className="font-medium">{connected}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Conectadas</TooltipContent>
        </Tooltip>

        {disconnected > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-destructive">
                <WifiOff className="size-3.5 shrink-0" />
                <span className="font-medium">{disconnected}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Desconectadas</TooltipContent>
          </Tooltip>
        )}

        {pending > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-warning">
                <Activity className="size-3.5 shrink-0 animate-pulse" />
                <span className="font-medium">{pending}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Pendentes (QR / pareando)</TooltipContent>
          </Tooltip>
        )}

        <span className="ml-auto text-xs text-muted-foreground">{total} instâncias</span>
      </div>

      {/* Footer */}
      {health && (
        <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5">
          <div className="flex items-center gap-1.5">
            <Zap className="size-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{health.latency_ms}ms</span>
          </div>

          {uptimePercent !== null && (
            <Badge
              variant={
                uptimePercent >= 90 ? "default" : uptimePercent >= 70 ? "secondary" : "destructive"
              }
              className="text-[10px] px-1.5 py-0"
            >
              {uptimePercent}% uptime
            </Badge>
          )}
        </div>
      )}
    </button>
  );
}
