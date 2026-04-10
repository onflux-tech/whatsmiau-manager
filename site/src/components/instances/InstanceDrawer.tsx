import { useMutation } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInstanceSnapshots } from "@/hooks/useInstanceSnapshots";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { proxy } from "@/lib/proxy";
import { INSTANCE_STATUS } from "@/lib/status";
import { useUIStore } from "@/stores/ui";
import { ConnectTab } from "./ConnectTab";
import { ProxyTab } from "./ProxyTab";
import { WebhookTab } from "./WebhookTab";

export function InstanceDrawer({ wid }: { wid: string }) {
  const { selectedInstance, drawerOpen, activeTab, closeDrawer, setActiveTab } = useUIStore();
  const isMobile = useIsMobile();

  const deleteMutation = useMutation({
    mutationFn: () => proxy.deleteInstance(wid, selectedInstance as string),
    onSuccess: async () => {
      await proxy.syncInstances(wid);
      closeDrawer();
      toast.success("Instância excluída");
    },
    onError: () => toast.error("Erro ao excluir instância"),
  });

  const { data: snapshots = [] } = useInstanceSnapshots(wid);

  const snapshot = snapshots.find((s) => s.instance_id === selectedInstance) ?? null;
  const isConnected = snapshot?.status === "open";
  const statusConfig = INSTANCE_STATUS[snapshot?.status ?? ""] ?? INSTANCE_STATUS.closed;

  return (
    <Sheet
      open={drawerOpen}
      onOpenChange={(open) => {
        if (!open) closeDrawer();
      }}
    >
      <SheetContent
        side="right"
        className={isMobile ? "w-full sm:max-w-full" : "w-[480px] sm:max-w-[480px]"}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {snapshot?.name || selectedInstance || "Instancia"}
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </SheetTitle>
          {snapshot?.phone && <SheetDescription>{snapshot.phone}</SheetDescription>}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          {selectedInstance && (
            <div className="px-4 pb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="connect" className="flex-1">
                    Conexao
                  </TabsTrigger>
                  <TabsTrigger value="webhook" className="flex-1">
                    Webhook
                  </TabsTrigger>
                  <TabsTrigger value="proxy" className="flex-1">
                    Proxy
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="connect" className="mt-6">
                  <ConnectTab wid={wid} iid={selectedInstance} isConnected={isConnected} />
                </TabsContent>

                <TabsContent value="webhook" className="mt-6">
                  <WebhookTab wid={wid} iid={selectedInstance} />
                </TabsContent>

                <TabsContent value="proxy" className="mt-6">
                  <ProxyTab wid={wid} iid={selectedInstance} />
                </TabsContent>
              </Tabs>

              <Separator className="my-6" />

              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Zona de perigo
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2">
                      <Trash2 className="size-4" />
                      Excluir instância
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir instância</AlertDialogTitle>
                      <AlertDialogDescription>
                        Essa ação é irreversível. A instância{" "}
                        <strong>{snapshot?.name || selectedInstance}</strong> será desconectada do
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
              </div>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
