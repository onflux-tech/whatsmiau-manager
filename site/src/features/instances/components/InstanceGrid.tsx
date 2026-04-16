import { CheckSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useInstanceSnapshots } from "@/hooks/useInstanceSnapshots";
import { usePollingHeartbeat } from "@/hooks/usePollingHeartbeat";
import { useUIStore } from "@/stores/ui";
import { BulkActionBar } from "./BulkActionBar";
import { CreateInstanceDialog } from "./CreateInstanceDialog";
import { AddInstanceCard, InstanceCard } from "./InstanceCard";

export function InstanceGrid({ wid }: { wid: string }) {
  const [createOpen, setCreateOpen] = useState(false);
  const { bulkMode, bulkSelected, selectAll, clearSelection } = useUIStore();

  usePollingHeartbeat(wid, "normal");

  const { data: snapshots = [] } = useInstanceSnapshots(wid);

  if (snapshots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">Nenhuma instância</p>
        <p className="mt-1 text-sm text-muted-foreground">Crie uma instância para começar</p>
        <div className="mt-6">
          <AddInstanceCard onClick={() => setCreateOpen(true)} />
        </div>
        <CreateInstanceDialog wid={wid} open={createOpen} onOpenChange={setCreateOpen} />
      </div>
    );
  }

  const allIds = snapshots.map((s) => s.instance_id);
  const allSelected = allIds.length > 0 && allIds.every((id) => bulkSelected.has(id));

  return (
    <div className="px-3 pb-20">
      {snapshots.length > 1 && (
        <div className="mb-2 flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
            onClick={() => {
              if (allSelected || bulkMode) clearSelection();
              else selectAll(allIds);
            }}
          >
            <CheckSquare className="size-3.5" />
            {allSelected ? "Desmarcar todas" : bulkMode ? "Cancelar seleção" : "Selecionar"}
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {snapshots.map((snap) => (
          <InstanceCard key={snap.id} wid={wid} snapshot={snap} />
        ))}
        <AddInstanceCard onClick={() => setCreateOpen(true)} />
      </div>
      <CreateInstanceDialog wid={wid} open={createOpen} onOpenChange={setCreateOpen} />
      <BulkActionBar wid={wid} />
    </div>
  );
}
