import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Clock, Send, Trash2, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { proxy } from "@/lib/proxy";

type MessageType = "text" | "image" | "audio" | "document";

interface TestHistoryEntry {
  id: string;
  timestamp: number;
  number: string;
  type: MessageType;
  content: string;
  success: boolean;
  response?: unknown;
}

const STORAGE_KEY = "wm-test-history";
const MAX_HISTORY = 10;

function loadHistory(iid: string): TestHistoryEntry[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${iid}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(iid: string, entries: TestHistoryEntry[]) {
  localStorage.setItem(`${STORAGE_KEY}:${iid}`, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}

export function TestMessageTab({ wid, iid }: { wid: string; iid: string }) {
  const [number, setNumber] = useState("");
  const [type, setType] = useState<MessageType>("text");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [lastResponse, setLastResponse] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<TestHistoryEntry[]>(() => loadHistory(iid));

  useEffect(() => {
    setHistory(loadHistory(iid));
  }, [iid]);

  const addToHistory = useCallback(
    (entry: Omit<TestHistoryEntry, "id" | "timestamp">) => {
      setHistory((prev) => {
        const next = [{ ...entry, id: crypto.randomUUID(), timestamp: Date.now() }, ...prev].slice(
          0,
          MAX_HISTORY,
        );
        saveHistory(iid, next);
        return next;
      });
    },
    [iid],
  );

  const sendMutation = useMutation({
    mutationFn: async () => {
      const target = number.replace(/\D/g, "");
      if (!target) throw new Error("Número inválido");

      let body: Record<string, unknown>;

      switch (type) {
        case "text":
          body = { number: target, textMessage: { text: content } };
          return proxy.sendMessage(wid, iid, "text", body);
        case "image":
          body = {
            number: target,
            mediaMessage: { mediatype: "image", media: mediaUrl, caption: content },
          };
          return proxy.sendMessage(wid, iid, "image", body);
        case "audio":
          body = { number: target, mediaMessage: { mediatype: "audio", media: mediaUrl } };
          return proxy.sendMessage(wid, iid, "audio", body);
        case "document":
          body = {
            number: target,
            mediaMessage: { mediatype: "document", media: mediaUrl, fileName: content || "file" },
          };
          return proxy.sendMessage(wid, iid, "document", body);
        default:
          throw new Error("Tipo não suportado");
      }
    },
    onSuccess: (data) => {
      const resp = (data ?? {}) as Record<string, unknown>;
      setLastResponse(resp);
      addToHistory({ number, type, content: content || mediaUrl, success: true, response: resp });
      toast.success("Mensagem enviada");
    },
    onError: (err) => {
      const errorData: Record<string, unknown> = {
        error: err instanceof Error ? err.message : String(err),
      };
      setLastResponse(errorData);
      addToHistory({
        number,
        type,
        content: content || mediaUrl,
        success: false,
        response: errorData,
      });
      toast.error("Erro ao enviar mensagem");
    },
  });

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(`${STORAGE_KEY}:${iid}`);
  }, [iid]);

  const needsMedia = type !== "text";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="test-number">Número destino</Label>
        <Input
          id="test-number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="+5511999999999"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="test-type">Tipo de mensagem</Label>
        <Select value={type} onValueChange={(v) => setType(v as MessageType)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Texto</SelectItem>
            <SelectItem value="image">Imagem</SelectItem>
            <SelectItem value="audio">Áudio</SelectItem>
            <SelectItem value="document">Documento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {needsMedia && (
        <div className="space-y-2">
          <Label htmlFor="test-media">URL da mídia</Label>
          <Input
            id="test-media"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/file.jpg"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="test-content">
          {type === "text" ? "Mensagem" : type === "document" ? "Nome do arquivo" : "Legenda"}
        </Label>
        <Input
          id="test-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            type === "text"
              ? "Olá, mundo!"
              : type === "document"
                ? "arquivo.pdf"
                : "Legenda opcional"
          }
        />
      </div>

      <Button
        className="w-full gap-2"
        onClick={() => sendMutation.mutate()}
        disabled={sendMutation.isPending || !number || (type === "text" ? !content : !mediaUrl)}
      >
        <Send className="size-4" />
        {sendMutation.isPending ? "Enviando..." : "Enviar teste"}
      </Button>

      {lastResponse && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Resposta
          </p>
          <pre className="max-h-40 overflow-auto rounded-lg border bg-muted/50 p-3 text-xs">
            {JSON.stringify(lastResponse, null, 2)}
          </pre>
        </div>
      )}

      {history.length > 0 && (
        <Collapsible>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground">
              <Clock className="size-3" />
              Histórico ({history.length})
            </CollapsibleTrigger>
            <Button variant="ghost" size="icon" className="size-6" onClick={clearHistory}>
              <Trash2 className="size-3" />
            </Button>
          </div>
          <CollapsibleContent className="mt-2 space-y-1.5">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs"
              >
                {entry.success ? (
                  <CheckCircle2 className="size-3 shrink-0 text-success" />
                ) : (
                  <XCircle className="size-3 shrink-0 text-destructive" />
                )}
                <span className="min-w-0 truncate font-mono">{entry.number}</span>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {entry.type}
                </Badge>
                <span className="ml-auto shrink-0 text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
