import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Phone, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import pb from "@/lib/pocketbase";
import { proxy } from "@/lib/proxy";
import type { InstanceSnapshot } from "@/lib/types";
import { sanitizeId } from "@/lib/utils";
import { useUIStore } from "@/stores/ui";

export function CheckNumberDialog({ wid }: { wid: string }) {
  const { checkNumberOpen, setCheckNumberOpen } = useUIStore();
  const [number, setNumber] = useState("");
  const [result, setResult] = useState<{
    checked: boolean;
    exists: boolean;
    jid?: string;
  } | null>(null);

  const safeWid = sanitizeId(wid);

  const { data: snapshots = [] } = useQuery({
    queryKey: ["instance-snapshots", wid],
    queryFn: () =>
      pb.collection("instance_snapshots").getFullList<InstanceSnapshot>({
        filter: `workspace = "${safeWid}"`,
        sort: "name",
      }),
    enabled: !!safeWid,
  });

  const connectedInstance = snapshots.find((s) => s.status === "open");

  const checkMutation = useMutation({
    mutationFn: async (num: string) => {
      if (!connectedInstance) throw new Error("Nenhuma instância conectada");
      return proxy.checkNumber(wid, connectedInstance.instance_id, [num]);
    },
    onSuccess: (data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        const entry = data[0];
        setResult({ checked: true, exists: !!entry.exists, jid: entry.jid });
      } else {
        setResult({ checked: true, exists: false });
      }
    },
    onError: () => {
      toast.error("Erro ao verificar número");
      setResult(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = number.replace(/\D/g, "");
    if (!cleaned) {
      toast.error("Insira um número válido");
      return;
    }
    setResult(null);
    checkMutation.mutate(cleaned);
  };

  const handleOpenChange = (open: boolean) => {
    setCheckNumberOpen(open);
    if (!open) {
      setNumber("");
      setResult(null);
    }
  };

  return (
    <Dialog open={checkNumberOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="size-4" />
            Verificar número
          </DialogTitle>
          <DialogDescription>
            Verifique se um número possui conta no WhatsApp
            {connectedInstance ? (
              <span className="mt-1 block text-xs">
                Via: <strong>{connectedInstance.name || connectedInstance.instance_id}</strong>
              </span>
            ) : (
              <span className="mt-1 block text-xs text-destructive">
                Nenhuma instância conectada
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              placeholder="5511999999999"
              value={number}
              onChange={(e) => {
                setNumber(e.target.value);
                setResult(null);
              }}
              className="flex-1 font-mono"
              autoFocus
            />
            <Button
              type="submit"
              disabled={!connectedInstance || checkMutation.isPending || !number}
            >
              {checkMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Verificar"}
            </Button>
          </div>

          {result?.checked && (
            <div
              className={`flex items-center gap-2 rounded-lg border p-3 ${
                result.exists
                  ? "border-success/30 bg-success/5 text-success"
                  : "border-destructive/30 bg-destructive/5 text-destructive"
              }`}
            >
              {result.exists ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <XCircle className="size-4 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {result.exists ? "Número válido" : "Número não encontrado"}
                </p>
                {result.jid && <p className="truncate text-xs opacity-70">{result.jid}</p>}
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
