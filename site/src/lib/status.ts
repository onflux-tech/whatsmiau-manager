export const INSTANCE_STATUS: Record<
  string,
  { dot: string; label: string; variant: "default" | "secondary" | "destructive" }
> = {
  open: { dot: "bg-success", label: "Conectado", variant: "default" },
  "qr-code": { dot: "bg-warning", label: "QR Code", variant: "secondary" },
  connecting: { dot: "bg-warning", label: "Conectando", variant: "secondary" },
  closed: { dot: "bg-destructive", label: "Desconectado", variant: "destructive" },
};
