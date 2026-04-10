import { Check, ChevronsUpDown, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHealthLatest } from "@/hooks/useHealthLatest";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<string, string> = {
  up: "bg-success",
  down: "bg-destructive",
  auth_error: "bg-warning",
};

export function WorkspaceSwitcher({ currentWid }: { currentWid: string }) {
  const navigate = useNavigate();

  const { data: workspaces = [] } = useWorkspaces();
  const { data: healthMap = {} } = useHealthLatest();

  const current = workspaces.find((w) => w.id === currentWid);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 font-semibold">
          <span className="flex size-5 items-center justify-center rounded bg-muted text-xs font-semibold">
            {current?.name?.charAt(0).toUpperCase() ?? "W"}
          </span>
          <span className="max-w-[120px] truncate">{current?.name ?? "Workspace"}</span>
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              STATUS_DOT[healthMap[currentWid]?.status ?? ""] ?? "bg-muted-foreground",
            )}
          />
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onSelect={() => {
              if (ws.id !== currentWid) navigate(`/w/${ws.id}`);
            }}
            className="flex items-center gap-2"
          >
            <span className="flex size-5 items-center justify-center rounded bg-muted text-xs font-semibold">
              {ws.name.charAt(0).toUpperCase()}
            </span>
            <span className="flex-1 truncate">{ws.name}</span>
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                STATUS_DOT[healthMap[ws.id]?.status ?? ""] ?? "bg-muted-foreground",
              )}
            />
            {ws.id === currentWid && <Check className="size-3.5" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/")} className="flex items-center gap-2">
          <LayoutGrid className="size-4 text-muted-foreground" />
          <span>Todos os workspaces</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
