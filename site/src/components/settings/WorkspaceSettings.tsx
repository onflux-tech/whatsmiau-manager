import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMediaQuery";
import pb from "@/lib/pocketbase";
import { useUIStore } from "@/stores/ui";

export function WorkspaceSettings({ wid }: { wid: string }) {
  const { settingsOpen, setSettingsOpen } = useUIStore();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");

  const { data: workspace, isLoading } = useQuery({
    queryKey: ["workspace-settings", wid],
    queryFn: async () => {
      const res = await fetch(`/api/workspace/${wid}/settings`, {
        headers: { Authorization: pb.authStore.token },
      });
      if (!res.ok) throw new Error("Failed to load settings");
      return res.json() as Promise<{ id: string; name: string; url: string; api_key: string }>;
    },
    enabled: settingsOpen,
  });

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setUrl(workspace.url);
      setApiKey(workspace.api_key);
    }
  }, [workspace]);

  const updateMutation = useMutation({
    mutationFn: () => pb.collection("workspaces").update(wid, { name, url, api_key: apiKey }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-settings", wid] });
      toast.success("Workspace atualizado");
    },
    onError: () => toast.error("Erro ao atualizar"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => pb.collection("workspaces").delete(wid),
    onSuccess: () => {
      setSettingsOpen(false);
      navigate("/");
      toast.success("Workspace removido");
    },
    onError: () => toast.error("Erro ao remover"),
  });

  return (
    <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
      <SheetContent
        side="right"
        className={isMobile ? "w-full sm:max-w-full" : "w-[420px] sm:max-w-[420px]"}
      >
        <SheetHeader>
          <SheetTitle>Configurações</SheetTitle>
          <SheetDescription>Configurações do workspace</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-1">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Carregando...</div>
          ) : (
            <div className="space-y-6 px-4 pb-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateMutation.mutate();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="cfg-name">Nome</Label>
                  <Input
                    id="cfg-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cfg-url">URL da API</Label>
                  <Input
                    id="cfg-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cfg-key">API Key</Label>
                  <Input
                    id="cfg-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </form>

              <Separator />

              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <h3 className="text-sm font-medium text-destructive">Zona de perigo</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Remover o workspace irá apagar todos os dados de health check e snapshots
                  associados.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="mt-3">
                      Remover workspace
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover workspace</AlertDialogTitle>
                      <AlertDialogDescription>
                        Deseja remover &quot;{workspace?.name}&quot;? Esta ação não pode ser
                        desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => deleteMutation.mutate()}
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
