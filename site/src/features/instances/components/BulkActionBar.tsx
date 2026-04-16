import { useMutation } from "@tanstack/react-query";
import { Link2Off, RefreshCw, Trash2, X } from "lucide-react";
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
import { proxy } from "@/lib/proxy";
import { useUIStore } from "@/stores/ui";

export function BulkActionBar({ wid }: { wid: string }) {
  const { bulkSelected, clearSelection } = useUIStore();

  const count = bulkSelected.size;

  const reconnectMutation = useMutation({
    mutationFn: async () => {
      const ids = Array.from(bulkSelected);
      const results = await Promise.allSettled(ids.map((iid) => proxy.connect(wid, iid, {})));
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) {
        toast.warning(`${ids.length - failed} reconectadas, ${failed} falharam`);
      } else {
        toast.success(`${ids.length} instância(s) reconectadas`);
      }
      await proxy.syncInstances(wid);
    },
    onError: () => toast.error("Erro ao reconectar instâncias"),
    onSettled: () => clearSelection(),
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const ids = Array.from(bulkSelected);
      const results = await Promise.allSettled(ids.map((iid) => proxy.logout(wid, iid)));
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) {
        toast.warning(`${ids.length - failed} desconectadas, ${failed} falharam`);
      } else {
        toast.success(`${ids.length} instância(s) desconectadas`);
      }
      await proxy.syncInstances(wid);
    },
    onError: () => toast.error("Erro ao desconectar instâncias"),
    onSettled: () => clearSelection(),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const ids = Array.from(bulkSelected);
      const results = await Promise.allSettled(ids.map((iid) => proxy.deleteInstance(wid, iid)));
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) {
        toast.warning(`${ids.length - failed} excluídas, ${failed} falharam`);
      } else {
        toast.success(`${ids.length} instância(s) excluídas`);
      }
      await proxy.syncInstances(wid);
    },
    onError: () => toast.error("Erro ao excluir instâncias"),
    onSettled: () => clearSelection(),
  });

  const isPending =
    reconnectMutation.isPending || disconnectMutation.isPending || deleteMutation.isPending;

  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="mx-auto w-full max-w-lg px-3 pb-3">
        <div className="glass flex items-center gap-1.5 rounded-xl border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur-md sm:gap-2 sm:px-4 sm:py-2.5">
          <span className="shrink-0 text-xs font-medium sm:text-sm">{count} sel.</span>

          <div className="mx-0.5 h-5 w-px shrink-0 bg-border sm:mx-1" />

          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1 px-2 text-xs sm:gap-1.5 sm:px-3 sm:text-sm"
              onClick={() => reconnectMutation.mutate()}
              disabled={isPending}
            >
              <RefreshCw className="size-3.5" />
              <span className="hidden sm:inline">Reconectar</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1 px-2 text-xs sm:gap-1.5 sm:px-3 sm:text-sm"
              onClick={() => disconnectMutation.mutate()}
              disabled={isPending}
            >
              <Link2Off className="size-3.5" />
              <span className="hidden sm:inline">Desconectar</span>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="shrink-0 gap-1 px-2 text-xs sm:gap-1.5 sm:px-3 sm:text-sm"
                  disabled={isPending}
                >
                  <Trash2 className="size-3.5" />
                  <span className="hidden sm:inline">Excluir</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Excluir {count} instância{count > 1 ? "s" : ""}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação é irreversível. As instâncias selecionadas serão desconectadas do
                    WhatsApp e removidas permanentemente.
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
          </div>

          <div className="mx-0.5 h-5 w-px shrink-0 bg-border sm:mx-1" />

          <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={clearSelection}>
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
