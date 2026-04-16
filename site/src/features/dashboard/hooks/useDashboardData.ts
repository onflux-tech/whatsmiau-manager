import { useQuery } from "@tanstack/react-query";
import { useHealthLatest } from "@/hooks/useHealthLatest";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import pb from "@/lib/pocketbase";
import type { HealthCheck, InstanceSnapshot, Workspace } from "@/lib/types";

export interface WorkspaceSummary {
  workspace: Workspace;
  health: HealthCheck | undefined;
  snapshots: InstanceSnapshot[];
  connected: number;
  disconnected: number;
  pending: number;
  total: number;
  uptimePercent: number | null;
}

export function useDashboardData() {
  const { data: workspaces = [], isLoading: wsLoading } = useWorkspaces();
  const { data: healthMap = {}, isLoading: healthLoading } = useHealthLatest();

  const { data: allSnapshots = [], isLoading: snapshotsLoading } = useQuery({
    queryKey: ["all-instance-snapshots-dashboard"],
    queryFn: () =>
      pb.collection("instance_snapshots").getFullList<InstanceSnapshot>({ sort: "name" }),
    refetchInterval: 30_000,
  });

  const { data: healthHistory = [] } = useQuery({
    queryKey: ["all-health-history-dashboard"],
    queryFn: () => pb.collection("health_checks").getFullList<HealthCheck>({ sort: "-created" }),
    refetchInterval: 60_000,
  });

  const summaries: WorkspaceSummary[] = workspaces.map((ws) => {
    const snapshots = allSnapshots.filter((s) => s.workspace === ws.id);
    const wsHistory = healthHistory.filter((h) => h.workspace === ws.id);
    const uptimePercent =
      wsHistory.length > 0
        ? Math.round((wsHistory.filter((h) => h.status === "up").length / wsHistory.length) * 100)
        : null;

    return {
      workspace: ws,
      health: healthMap[ws.id],
      snapshots,
      connected: snapshots.filter((s) => s.status === "open").length,
      disconnected: snapshots.filter((s) => s.status === "closed").length,
      pending: snapshots.filter((s) => s.status === "qr-code" || s.status === "connecting").length,
      total: snapshots.length,
      uptimePercent,
    };
  });

  const globalTotals = summaries.reduce(
    (acc, s) => ({
      total: acc.total + s.total,
      connected: acc.connected + s.connected,
      disconnected: acc.disconnected + s.disconnected,
      pending: acc.pending + s.pending,
    }),
    { total: 0, connected: 0, disconnected: 0, pending: 0 },
  );

  return {
    summaries,
    globalTotals,
    isLoading: wsLoading || healthLoading || snapshotsLoading,
  };
}
