import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { proxy, type WebhookConfig } from "@/lib/proxy";

const WEBHOOK_EVENTS = [
  "connection.update",
  "contacts.upsert",
  "messages.upsert",
  "messages.update",
  "messages.delete",
] as const;

export function WebhookTab({ wid, iid }: { wid: string; iid: string }) {
  const [url, setUrl] = useState("");
  const [byEvents, setByEvents] = useState(false);
  const [base64, setBase64] = useState(false);
  const [events, setEvents] = useState<string[]>([]);

  const { isLoading } = useQuery({
    queryKey: ["webhook", wid, iid],
    queryFn: async () => {
      const data = await proxy.getWebhook(wid, iid);
      setUrl(data.url || "");
      setByEvents(data.byEvents || false);
      setBase64(data.base64 || false);
      setEvents(data.events || []);
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<WebhookConfig>) => proxy.setWebhook(wid, iid, data),
    onSuccess: () => toast.success("Webhook salvo"),
    onError: () => toast.error("Erro ao salvar webhook"),
  });

  const toggleEvent = (event: string) => {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate({
          url,
          byEvents,
          base64,
          events: byEvents ? events : undefined,
        });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="webhook-url">URL do Webhook</Label>
        <Input
          id="webhook-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/webhook"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="base64">Enviar mídia em Base64</Label>
        <Switch id="base64" checked={base64} onCheckedChange={setBase64} />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="by-events">Filtrar por eventos</Label>
        <Switch id="by-events" checked={byEvents} onCheckedChange={setByEvents} />
      </div>

      {byEvents && (
        <div className="space-y-2 rounded-lg border p-3">
          {WEBHOOK_EVENTS.map((evt) => (
            <label key={evt} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={events.includes(evt)}
                onChange={() => toggleEvent(evt)}
                className="accent-primary"
              />
              {evt}
            </label>
          ))}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Salvando..." : "Salvar webhook"}
      </Button>
    </form>
  );
}
