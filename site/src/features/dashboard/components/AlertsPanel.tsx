import { Activity, Bell, CheckCheck, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAlerts } from "@/hooks/useAlerts";
import type { Alert } from "@/lib/proxy";
import { cn } from "@/lib/utils";

const KIND_CONFIG: Record<
  Alert["kind"],
  { label: string; icon: React.ReactNode; className: string }
> = {
  disconnected: {
    label: "Desconectada",
    icon: <WifiOff className="size-3.5 shrink-0" />,
    className: "text-destructive",
  },
  reconnected: {
    label: "Reconectada",
    icon: <Wifi className="size-3.5 shrink-0" />,
    className: "text-success",
  },
  qr_pending: {
    label: "QR pendente",
    icon: <Activity className="size-3.5 shrink-0 animate-pulse" />,
    className: "text-warning",
  },
};

function formatRelative(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

interface AlertsPanelProps {
  wid?: string;
}

export function AlertsPanel({ wid }: AlertsPanelProps) {
  const { alerts, unreadCount, isLoading, markRead, markAllRead, isMarkingAll } = useAlerts(wid);

  const hasUnread = unreadCount > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative" aria-label="Alertas">
          <Bell className="size-4" />
          {hasUnread && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Alertas</span>
            {hasUnread && (
              <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                {unreadCount} novo{unreadCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-xs text-muted-foreground"
              onClick={() => markAllRead()}
              disabled={isMarkingAll}
            >
              <CheckCheck className="size-3" />
              Marcar todos
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Bell className="mb-2 size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhum alerta</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {alerts.map((alert) => {
                const config = KIND_CONFIG[alert.kind];
                return (
                  <li
                    key={alert.id}
                    className={cn(
                      "flex items-start gap-2 px-3 py-2.5 transition-colors",
                      !alert.read && "bg-muted/40",
                    )}
                  >
                    <span className={cn("mt-0.5", config.className)}>{config.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {alert.instance_name || "Instância"}
                      </p>
                      <p className={cn("text-xs", config.className)}>{config.label}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {formatRelative(alert.created)}
                      </p>
                    </div>
                    {!alert.read && (
                      <button
                        type="button"
                        onClick={() => markRead(alert.id)}
                        className="mt-0.5 shrink-0 text-[10px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                      >
                        lido
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
