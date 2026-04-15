import { useQuery } from "@tanstack/react-query";
import { BookOpen, Moon, Phone, RefreshCw, Sun } from "lucide-react";
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
import { WorkspaceAvatar } from "@/components/workspace/WorkspaceAvatar";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import pb from "@/lib/pocketbase";
import type { InstanceSnapshot } from "@/lib/types";
import { useThemeStore } from "@/stores/theme";
import { useUIStore } from "@/stores/ui";

export function CommandPalette({ currentWid }: { currentWid?: string }) {
  const { commandOpen, setCommandOpen, selectInstance, setCheckNumberOpen } = useUIStore();
  const { toggle: toggleTheme, dark } = useThemeStore();
  const navigate = useNavigate();

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
      <CommandInput placeholder="Buscar instâncias, workspaces, ações..." />
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
              <WorkspaceAvatar workspace={ws} size="sm" className="mr-2" />
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
            {dark ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
            Alternar tema ({dark ? "claro" : "escuro"})
          </CommandItem>

          {currentWid && (
            <CommandItem
              onSelect={() => {
                proxy_sync(currentWid);
                setCommandOpen(false);
              }}
            >
              <RefreshCw className="mr-2 size-4" />
              Sincronizar instâncias
            </CommandItem>
          )}

          <CommandItem
            onSelect={() => {
              setCommandOpen(false);
              setCheckNumberOpen(true);
            }}
          >
            <Phone className="mr-2 size-4" />
            Verificar número no WhatsApp
          </CommandItem>

          <CommandItem
            onSelect={() => {
              navigate("/docs");
              setCommandOpen(false);
            }}
          >
            <BookOpen className="mr-2 size-4" />
            API Docs
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

async function proxy_sync(wid: string) {
  const { proxy } = await import("@/lib/proxy");
  await proxy.syncInstances(wid);
}
