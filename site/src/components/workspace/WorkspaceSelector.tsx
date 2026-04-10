import { useMutation } from "@tanstack/react-query";
import { BookOpen, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useHealthLatest } from "@/hooks/useHealthLatest";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import pb from "@/lib/pocketbase";
import type { HealthCheck, Workspace } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WorkspaceSelector() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [addOpen, setAddOpen] = useState(false);

  const { data: workspaces = [] } = useWorkspaces();
  const { data: healthMap = {} } = useHealthLatest();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-dot-pattern flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">Workspaces</h1>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" asChild>
                  <Link to="/docs">
                    <BookOpen className="size-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>API Docs</TooltipContent>
            </Tooltip>
            <Button variant="ghost" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 pb-8">
          {workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground">Nenhum workspace</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Adicione um workspace para começar
              </p>
              <Button className="mt-6" onClick={() => setAddOpen(true)}>
                <Plus className="size-4" />
                Novo workspace
              </Button>
            </div>
          ) : (
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((ws) => (
                <WorkspaceCard
                  key={ws.id}
                  workspace={ws}
                  health={healthMap[ws.id]}
                  onClick={() => navigate(`/w/${ws.id}`)}
                />
              ))}
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="glass flex items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground hover:text-foreground"
              >
                <Plus className="size-4" />
                Novo workspace
              </button>
            </div>
          )}
        </main>

        <AddWorkspaceDialog open={addOpen} onOpenChange={setAddOpen} />
      </div>
    </TooltipProvider>
  );
}

function WorkspaceCard({
  workspace,
  health,
  onClick,
}: {
  workspace: Workspace;
  health?: HealthCheck;
  onClick: () => void;
}) {
  const statusColor =
    health?.status === "up"
      ? "bg-success"
      : health?.status === "auth_error"
        ? "bg-warning"
        : health?.status === "down"
          ? "bg-destructive"
          : "bg-muted-foreground";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "glass flex flex-col rounded-lg border p-4 text-left",
        "hover:border-primary/30 hover:shadow-[0_0_12px_rgba(0,189,176,0.08)]",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex size-8 items-center justify-center rounded-md bg-muted text-sm font-semibold">
          {workspace.name.charAt(0).toUpperCase()}
        </span>
        <span className={cn("h-2.5 w-2.5 rounded-full", statusColor)} />
      </div>
      <h3 className="mt-2 truncate text-sm font-medium">{workspace.name}</h3>
      {health && (
        <div className="mt-1.5 flex items-center gap-2">
          <Badge variant={health.status === "up" ? "default" : "destructive"}>
            {health.instances_connected}/{health.instances_total}
          </Badge>
          {health.status === "up" && (
            <span className="text-xs text-muted-foreground">{health.latency_ms}ms</span>
          )}
        </div>
      )}
    </button>
  );
}

function AddWorkspaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");

  const mutation = useMutation({
    mutationFn: () => pb.collection("workspaces").create({ name, url, api_key: apiKey }),
    onSuccess: () => {
      onOpenChange(false);
      setName("");
      setUrl("");
      setApiKey("");
      toast.success("Workspace adicionado");
    },
    onError: () => toast.error("Erro ao criar workspace"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo workspace</DialogTitle>
          <DialogDescription>Conecte uma instância WhatsMiau API</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
          autoComplete="off"
        >
          <div className="space-y-2">
            <Label htmlFor="ws-name">Nome</Label>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Produção"
              required
              autoComplete="off"
              data-1p-ignore
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws-url">URL da API</Label>
            <Input
              id="ws-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com"
              required
              autoComplete="off"
              data-1p-ignore
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws-key">API Key</Label>
            <Input
              id="ws-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sua-api-key"
              required
              autoComplete="new-password"
              data-1p-ignore
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
