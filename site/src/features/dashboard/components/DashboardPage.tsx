import { useMutation } from "@tanstack/react-query";
import { Activity, BookOpen, LogOut, Plus, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
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
import { IconPicker } from "@/features/workspace/components/IconPicker";
import pb from "@/lib/pocketbase";
import { cn } from "@/lib/utils";
import { useDashboardData } from "../hooks/useDashboardData";
import { AlertsPanel } from "./AlertsPanel";
import { WorkspaceCard } from "./WorkspaceCard";

export function DashboardPage() {
  const { logout } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const { summaries, globalTotals, isLoading } = useDashboardData();

  const hasWorkspaces = summaries.length > 0;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-dot-pattern flex min-h-dvh flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            {hasWorkspaces && (
              <Badge variant="secondary" className="font-mono text-xs">
                {summaries.length} {summaries.length === 1 ? "workspace" : "workspaces"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <AlertsPanel />
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={logout}>
                  <LogOut className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sair</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Global metrics bar */}
        {hasWorkspaces && (
          <div className="border-b border-border/60 bg-muted/30 px-4 py-2">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 text-sm">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Global
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    <span className="font-medium">{globalTotals.total}</span>
                    <span className="text-muted-foreground">instâncias</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Total de instâncias em todos os workspaces</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-success">
                    <Wifi className="size-3.5" />
                    <span className="font-medium">{globalTotals.connected}</span>
                    <span className="text-muted-foreground">conectadas</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Total de instâncias conectadas</TooltipContent>
              </Tooltip>

              {globalTotals.disconnected > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-destructive">
                      <WifiOff className="size-3.5" />
                      <span className="font-medium">{globalTotals.disconnected}</span>
                      <span className="text-muted-foreground">desconectadas</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Instâncias sem sessão ativa</TooltipContent>
                </Tooltip>
              )}

              {globalTotals.pending > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-warning">
                      <Activity className="size-3.5 animate-pulse" />
                      <span className="font-medium">{globalTotals.pending}</span>
                      <span className="text-muted-foreground">pendentes</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Aguardando QR Code ou pareamento</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 px-4 pb-8 pt-4">
          {isLoading && !hasWorkspaces ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Carregando workspaces...</p>
              </div>
            </div>
          ) : !hasWorkspaces ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div
                className={cn(
                  "mb-4 flex h-14 w-14 items-center justify-center rounded-full",
                  "bg-muted/50 text-muted-foreground",
                )}
              >
                <Wifi className="size-7" />
              </div>
              <p className="font-medium">Nenhum workspace ainda</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Adicione um workspace para começar a gerenciar suas instâncias
              </p>
              <Button className="mt-6" onClick={() => setAddOpen(true)}>
                <Plus className="size-4" />
                Novo workspace
              </Button>
            </div>
          ) : (
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {summaries.map((summary) => (
                  <WorkspaceCard key={summary.workspace.id} summary={summary} />
                ))}

                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="glass flex min-h-[120px] items-center justify-center gap-2 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  <Plus className="size-4" />
                  Novo workspace
                </button>
              </div>
            </div>
          )}
        </main>

        <AddWorkspaceDialog open={addOpen} onOpenChange={setAddOpen} />
      </div>
    </TooltipProvider>
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
  const [icon, setIcon] = useState("");
  const [iconColor, setIconColor] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingFileName, setPendingFileName] = useState("");

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("url", url);
      fd.append("api_key", apiKey);
      if (icon) fd.append("icon", icon);
      if (iconColor) fd.append("icon_color", iconColor);
      if (pendingFile) fd.append("icon_file", pendingFile);
      return pb.collection("workspaces").create(fd);
    },
    onSuccess: () => {
      onOpenChange(false);
      setName("");
      setUrl("");
      setApiKey("");
      setIcon("");
      setIconColor("");
      setPendingFile(null);
      setPendingFileName("");
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
            <Label>Ícone</Label>
            <IconPicker
              icon={icon}
              iconColor={iconColor}
              iconFile={pendingFileName}
              onIconChange={setIcon}
              onColorChange={setIconColor}
              onFileChange={(f) => {
                setPendingFile(f);
                setPendingFileName(f?.name ?? "");
              }}
              onFileClear={() => {
                setPendingFile(null);
                setPendingFileName("");
              }}
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
