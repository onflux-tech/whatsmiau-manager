import { useParams } from "react-router";
import { CommandPalette } from "@/components/command/CommandPalette";
import { InstanceDrawer } from "@/components/instances/InstanceDrawer";
import { InstanceGrid } from "@/components/instances/InstanceGrid";
import { WorkspaceSettings } from "@/components/settings/WorkspaceSettings";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUISync } from "@/hooks/useUISync";
import { StatsBar } from "./StatsBar";
import { TopBar } from "./TopBar";

export function WorkspaceShell() {
  const { wid } = useParams<{ wid: string }>();

  if (!wid) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <ShellInner wid={wid} />
    </TooltipProvider>
  );
}

function ShellInner({ wid }: { wid: string }) {
  useUISync();

  return (
    <div className="bg-dot-pattern min-h-dvh">
      <TopBar wid={wid} />
      <StatsBar wid={wid} />

      <main className="pt-1">
        <InstanceGrid wid={wid} />
      </main>

      <InstanceDrawer wid={wid} />
      <CommandPalette currentWid={wid} />
      <WorkspaceSettings wid={wid} />
    </div>
  );
}
