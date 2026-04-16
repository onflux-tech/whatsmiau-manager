import { Activity, Bell, Check, CheckCheck, Trash2, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAlerts } from "@/hooks/useAlerts";
import type { Alert } from "@/lib/proxy";
import { cn } from "@/lib/utils";

const KIND_CONFIG: Record<
  Alert["kind"],
  { label: string; icon: React.ReactNode; color: string; dot: string }
> = {
  disconnected: {
    label: "Desconectada",
    icon: <WifiOff className="size-3.5 shrink-0" />,
    color: "text-destructive",
    dot: "bg-destructive",
  },
  reconnected: {
    label: "Reconectada",
    icon: <Wifi className="size-3.5 shrink-0" />,
    color: "text-emerald-500",
    dot: "bg-emerald-500",
  },
  qr_pending: {
    label: "QR pendente",
    icon: <Activity className="size-3.5 shrink-0 animate-pulse" />,
    color: "text-amber-500",
    dot: "bg-amber-500",
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

const MAX_VISIBLE = 30;

export function AlertsPanel({ wid }: AlertsPanelProps) {
  const {
    alerts,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    isMarkingAll,
    clearRead,
    isClearing,
  } = useAlerts(wid);

  const hasUnread = unreadCount > 0;
  const visibleAlerts = alerts.slice(0, MAX_VISIBLE);
  const readCount = alerts.filter((a) => a.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative"
          aria-label={`Alertas${hasUnread ? ` — ${unreadCount} não lidos` : ""}`}
        >
          <Bell className={cn("size-4", hasUnread && "text-foreground")} />
          {hasUnread && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        collisionPadding={16}
        className="w-[calc(100vw-2rem)] sm:w-80 p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notificações</span>
            {hasUnread && (
              <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                {unreadCount} {unreadCount === 1 ? "nova" : "novas"}
              </Badge>
            )}
          </div>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => markAllRead()}
              disabled={isMarkingAll}
            >
              <CheckCheck className="size-3" />
              Marcar todas
            </Button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="max-h-[360px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="mb-2 size-8 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">Tudo certo por aqui</p>
              <p className="mt-0.5 text-xs text-muted-foreground/60">Nenhuma notificação ainda</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {visibleAlerts.map((alert) => {
                const config = KIND_CONFIG[alert.kind];
                const isUnread = !alert.read;
                return (
                  <li
                    key={alert.id}
                    className={cn(
                      "group relative flex items-start gap-3 px-3 py-3 transition-colors",
                      isUnread ? "bg-muted/30 hover:bg-muted/50" : "opacity-60 hover:opacity-80",
                    )}
                  >
                    {/* Unread indicator */}
                    {isUnread && (
                      <span
                        className={cn("absolute left-0 top-0 h-full w-0.5 rounded-r", config.dot)}
                      />
                    )}

                    {/* Icon */}
                    <span
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                        isUnread ? "bg-muted" : "bg-transparent",
                        config.color,
                      )}
                    >
                      {config.icon}
                    </span>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium leading-tight">
                        {alert.instance_name || "Instância"}
                      </p>
                      <p className={cn("mt-0.5 text-xs", config.color)}>{config.label}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatRelative(alert.created)}
                      </p>
                    </div>

                    {/* Mark as read button — icon only, shows on hover for unread */}
                    {isUnread && (
                      <button
                        type="button"
                        onClick={() => markRead(alert.id)}
                        title="Marcar como lida"
                        className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                      >
                        <Check className="size-3.5" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>

        {/* Footer */}
        {alerts.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-3 py-1.5">
            <p className="text-[10px] text-muted-foreground/60">
              {alerts.length > MAX_VISIBLE
                ? `Mostrando ${MAX_VISIBLE} de ${alerts.length}`
                : `${alerts.length} notificaç${alerts.length === 1 ? "ão" : "ões"}`}
            </p>
            {readCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 gap-1 px-1.5 text-[10px] text-muted-foreground hover:text-destructive"
                onClick={() => clearRead()}
                disabled={isClearing}
              >
                <Trash2 className="size-2.5" />
                Limpar lidas
              </Button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
