import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
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
import { proxy } from "@/lib/proxy";

export function CreateInstanceDialog({
  wid,
  open,
  onOpenChange,
}: {
  wid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [instanceId, setInstanceId] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const existing = await proxy.listInstances(wid);
      if (existing.some((i) => i.id === instanceId)) {
        throw new Error("duplicate");
      }
      await proxy.createInstance(wid, { instanceName: instanceId });
      await proxy.syncInstances(wid);
    },
    onSuccess: () => {
      onOpenChange(false);
      setInstanceId("");
      toast.success("Instância criada");
    },
    onError: (err) =>
      toast.error(
        err.message === "duplicate"
          ? "Já existe uma instância com esse nome"
          : "Erro ao criar instância",
      ),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova instância</DialogTitle>
          <DialogDescription>Crie uma instância WhatsApp</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="instance-id">ID da instância</Label>
            <Input
              id="instance-id"
              value={instanceId}
              onChange={(e) => setInstanceId(e.target.value)}
              placeholder="minha-instancia"
              required
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
