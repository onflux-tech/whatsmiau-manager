import { useMutation } from "@tanstack/react-query";
import { Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePollingHeartbeat } from "@/hooks/usePollingHeartbeat";
import { type ConnectResponse, proxy } from "@/lib/proxy";

export function ConnectTab({
  wid,
  iid,
  isConnected,
}: {
  wid: string;
  iid: string;
  isConnected: boolean;
}) {
  const [mode, setMode] = useState<"qr" | "phone">("qr");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<ConnectResponse | null>(null);

  usePollingHeartbeat(wid, result && !isConnected ? "fast" : "normal");

  useEffect(() => {
    if (isConnected) {
      setResult(null);
    }
  }, [isConnected]);

  const connectMutation = useMutation({
    mutationFn: () => proxy.connect(wid, iid, mode === "phone" ? { number: phone } : {}),
    onSuccess: async (data) => {
      if (data.connected) {
        await proxy.syncInstances(wid);
        return;
      }
      setResult(data);
      proxy.syncInstances(wid);
    },
    onError: () => toast.error("Erro ao conectar"),
  });

  const logoutMutation = useMutation({
    mutationFn: () => proxy.logout(wid, iid),
    onSuccess: async () => {
      await proxy.syncInstances(wid);
      setResult(null);
      toast.success("Desconectado");
    },
    onError: () => toast.error("Erro ao desconectar"),
  });

  if (isConnected) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex flex-col items-center gap-3 rounded-lg border border-success/20 bg-success/5 px-4 py-5">
          <div className="flex size-10 items-center justify-center rounded-full bg-success/10">
            <Wifi className="size-5 text-success" />
          </div>
          <div>
            <p className="text-sm font-semibold text-success">Instância conectada</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Sessão WhatsApp ativa</p>
          </div>
        </div>
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? "Desconectando..." : "Desconectar"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={mode === "qr" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("qr")}
        >
          QR Code
        </Button>
        <Button
          variant={mode === "phone" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("phone")}
        >
          Código de pareamento
        </Button>
      </div>

      {mode === "phone" && (
        <div className="space-y-2">
          <Label htmlFor="phone">Número do telefone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+5511999999999"
          />
        </div>
      )}

      <Button
        className="w-full"
        onClick={() => connectMutation.mutate()}
        disabled={connectMutation.isPending || (mode === "phone" && !phone)}
      >
        {connectMutation.isPending ? "Conectando..." : "Conectar"}
      </Button>

      {result?.base64 && (
        <div className="flex justify-center">
          <img
            src={
              result.base64.startsWith("data:")
                ? result.base64
                : `data:image/png;base64,${result.base64}`
            }
            alt="QR Code"
            className="rounded-lg border bg-white p-2"
            width={256}
            height={256}
          />
        </div>
      )}

      {result?.pairingCode && (
        <div className="glass rounded-lg border p-4 text-center">
          <p className="text-xs text-muted-foreground">Código de pareamento</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-primary">
            {result.pairingCode}
          </p>
        </div>
      )}
    </div>
  );
}
