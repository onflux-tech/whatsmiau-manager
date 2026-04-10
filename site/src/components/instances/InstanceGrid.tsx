import { useState } from "react";
import { useInstanceSnapshots } from "@/hooks/useInstanceSnapshots";
import { usePollingHeartbeat } from "@/hooks/usePollingHeartbeat";
import { CreateInstanceDialog } from "./CreateInstanceDialog";
import { AddInstanceCard, InstanceCard } from "./InstanceCard";

export function InstanceGrid({ wid }: { wid: string }) {
  const [createOpen, setCreateOpen] = useState(false);

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

  return (
    <div className="px-3 pb-20">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {snapshots.map((snap) => (
          <InstanceCard key={snap.id} wid={wid} snapshot={snap} />
        ))}
        <AddInstanceCard onClick={() => setCreateOpen(true)} />
      </div>
      <CreateInstanceDialog wid={wid} open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
