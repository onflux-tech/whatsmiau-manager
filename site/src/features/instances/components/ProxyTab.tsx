import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ProxyConfig, proxy } from "@/lib/proxy";

export function ProxyTab({ wid, iid }: { wid: string; iid: string }) {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [protocol, setProtocol] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { isLoading } = useQuery({
    queryKey: ["proxy-config", wid, iid],
    queryFn: async () => {
      const instance = await proxy.getInstanceFull(wid, iid);
      if (instance) {
        setHost(instance.proxyHost || "");
        setPort(instance.proxyPort || "");
        setProtocol(instance.proxyProtocol || "");
        setUsername(instance.proxyUsername || "");
        setPassword(instance.proxyPassword || "");
      }
      return instance;
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ProxyConfig) => proxy.updateInstance(wid, iid, data),
    onSuccess: () => toast.success("Proxy salvo"),
    onError: () => toast.error("Erro ao salvar proxy"),
  });

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate({
          proxyHost: host,
          proxyPort: port,
          proxyProtocol: protocol,
          proxyUsername: username,
          proxyPassword: password,
        });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="proxy-host">Host</Label>
          <Input
            id="proxy-host"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="proxy.example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="proxy-port">Porta</Label>
          <Input
            id="proxy-port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="1080"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="proxy-protocol">Protocolo</Label>
        <Select value={protocol} onValueChange={setProtocol}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Nenhum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            <SelectItem value="SOCKS5">SOCKS5</SelectItem>
            <SelectItem value="HTTP">HTTP</SelectItem>
            <SelectItem value="HTTPS">HTTPS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="proxy-username">Usuário</Label>
          <Input
            id="proxy-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            autoComplete="off"
            data-1p-ignore
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="proxy-password">Senha</Label>
          <Input
            id="proxy-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoComplete="new-password"
            data-1p-ignore
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Salvando..." : "Salvar proxy"}
      </Button>
    </form>
  );
}
