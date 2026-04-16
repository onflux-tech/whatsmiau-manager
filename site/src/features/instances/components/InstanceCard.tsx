import { useMutation } from "@tanstack/react-query";
import { Check, Plus, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { proxy } from "@/lib/proxy";
import { INSTANCE_STATUS } from "@/lib/status";
import type { InstanceSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui";

export function InstanceCard({ wid, snapshot }: { wid: string; snapshot: InstanceSnapshot }) {
  const { selectedInstance, selectInstance, closeDrawer, bulkMode, bulkSelected, toggleSelected } =
    useUIStore();
  const isActive = selectedInstance === snapshot.instance_id;
  const isChecked = bulkSelected.has(snapshot.instance_id);
  const config = INSTANCE_STATUS[snapshot.status] ?? INSTANCE_STATUS.closed;

  const deleteMutation = useMutation({
    mutationFn: () => proxy.deleteInstance(wid, snapshot.instance_id),
    onSuccess: async () => {
      if (isActive) closeDrawer();
      await proxy.syncInstances(wid);
      toast.success("Instância excluída");
    },
    onError: () => toast.error("Erro ao excluir instância"),
  });

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => {
        if (bulkMode) {
          toggleSelected(snapshot.instance_id);
        } else {
          selectInstance(snapshot.instance_id);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (bulkMode) toggleSelected(snapshot.instance_id);
          else selectInstance(snapshot.instance_id);
        }
      }}
      className={cn(
        "group/card glass cursor-pointer gap-0 rounded-lg border p-3 py-3 shadow-none transition-all",
        isActive
          ? "border-primary shadow-[0_0_12px_rgba(0,189,176,0.25)]"
          : "hover:border-primary/30",
        isChecked && "border-primary/50 bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <label
            className={cn(
              "relative flex size-5 shrink-0 items-center justify-center rounded border transition-all cursor-pointer",
              bulkMode || isChecked ? "opacity-100" : "opacity-0 group-hover/card:opacity-100",
              isChecked
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/30 hover:border-primary/50",
            )}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggleSelected(snapshot.instance_id)}
              className="sr-only"
            />
            {isChecked && <Check className="size-3" />}
          </label>
          <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", config.dot)} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{snapshot.name || snapshot.instance_id}</p>
            {snapshot.phone && (
              <p className="truncate text-xs text-muted-foreground">{snapshot.phone}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 group-hover/card:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir instância</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação é irreversível. A instância{" "}
                  <strong>{snapshot.name || snapshot.instance_id}</strong> será desconectada do
                  WhatsApp e removida permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      </div>
    </Card>
  );
}

export function AddInstanceCard({ onClick }: { onClick: () => void }) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="glass flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-3 py-3 shadow-none text-muted-foreground hover:border-primary/30 hover:text-primary"
    >
      <Plus className="size-4" />
      <span className="text-sm font-medium">Nova instância</span>
    </Card>
  );
}
