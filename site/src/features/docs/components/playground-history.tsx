import { Clock, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { HistoryEntry } from "./playground-sheet";
import { METHOD_STYLE, statusColor } from "./playground-utils";

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface HistoryPopoverProps {
  entries: HistoryEntry[];
  onClear: () => void;
  onReplay?: (entry: HistoryEntry) => void;
}

export function HistoryPopover({ entries, onClear, onReplay }: HistoryPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">History</span>
          {entries.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {entries.length > 9 ? "9+" : entries.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Request History
          </span>
          {entries.length > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onClear}>
              <Trash2 className="mr-1 h-3 w-3" /> Clear
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
              No requests yet
            </div>
          ) : (
            entries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="flex w-full items-center gap-2 border-b border-border/50 px-3 py-2 text-left transition-colors last:border-0 hover:bg-muted/50"
                onClick={() => onReplay?.(entry)}
              >
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 font-mono text-[10px] font-bold",
                    METHOD_STYLE[entry.method],
                  )}
                >
                  {entry.method}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{entry.title}</p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                    {entry.path}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <Badge
                    variant="outline"
                    className={cn("font-mono text-[10px] font-bold", statusColor(entry.status))}
                  >
                    {entry.status}
                  </Badge>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {entry.duration}ms &middot; {relativeTime(entry.timestamp)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
