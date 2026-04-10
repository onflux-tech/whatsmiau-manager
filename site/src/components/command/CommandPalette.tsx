import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import pb from "@/lib/pocketbase";
import type { InstanceSnapshot } from "@/lib/types";
import { useThemeStore } from "@/stores/theme";
import { useUIStore } from "@/stores/ui";

export function CommandPalette({ currentWid }: { currentWid?: string }) {
  const { commandOpen, setCommandOpen, selectInstance } = useUIStore();
  const { toggle: toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [commandOpen, setCommandOpen]);

  const { data: workspaces = [] } = useWorkspaces();

  const { data: allSnapshots = [] } = useQuery({
    queryKey: ["all-instance-snapshots"],
    queryFn: () =>
      pb.collection("instance_snapshots").getFullList<InstanceSnapshot>({ sort: "name" }),
    enabled: commandOpen,
  });

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Buscar instâncias, workspaces..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        {allSnapshots.length > 0 && (
          <CommandGroup heading="Instâncias">
            {allSnapshots.map((snap) => {
              const ws = workspaces.find((w) => w.id === snap.workspace);
              return (
                <CommandItem
                  key={snap.id}
                  value={`${snap.name} ${snap.phone} ${snap.instance_id}`}
                  onSelect={() => {
                    if (snap.workspace !== currentWid) {
                      navigate(`/w/${snap.workspace}?instance=${snap.instance_id}`);
                    } else {
                      selectInstance(snap.instance_id);
                    }
                    setCommandOpen(false);
                  }}
                >
                  <span
                    className={`mr-2 h-2 w-2 rounded-full ${snap.status === "open" ? "bg-success" : snap.status === "closed" ? "bg-destructive" : "bg-warning"}`}
                  />
                  <span className="flex-1">{snap.name || snap.instance_id}</span>
                  {snap.phone && (
                    <span className="text-xs text-muted-foreground">{snap.phone}</span>
                  )}
                  {ws && <span className="ml-2 text-xs text-muted-foreground">{ws.name}</span>}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        <CommandGroup heading="Workspaces">
          {workspaces.map((ws) => (
            <CommandItem
              key={ws.id}
              value={`workspace ${ws.name}`}
              onSelect={() => {
                navigate(`/w/${ws.id}`);
                setCommandOpen(false);
              }}
            >
              <span className="mr-2 flex size-5 items-center justify-center rounded bg-muted text-xs font-semibold">
                {ws.name.charAt(0).toUpperCase()}
              </span>
              {ws.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Ações">
          <CommandItem
            onSelect={() => {
              toggleTheme();
              setCommandOpen(false);
            }}
          >
            Alternar tema (claro/escuro)
          </CommandItem>
          {currentWid && (
            <CommandItem
              onSelect={() => {
                proxy_sync(currentWid);
                setCommandOpen(false);
              }}
            >
              Sincronizar instâncias
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

async function proxy_sync(wid: string) {
  const { proxy } = await import("@/lib/proxy");
  await proxy.syncInstances(wid);
}
