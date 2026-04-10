import { useQuery } from "@tanstack/react-query";
import pb from "@/lib/pocketbase";
import type { HealthCheck } from "@/lib/types";

export function useHealthLatest() {
  return useQuery({
    queryKey: ["health-latest"],
    queryFn: async () => {
      const checks = await pb
        .collection("health_checks")
        .getFullList<HealthCheck>({ sort: "-created" });
      const map: Record<string, HealthCheck> = {};
      for (const c of checks) {
        if (!map[c.workspace]) map[c.workspace] = c;
      }
      return map;
    },
    refetchInterval: 60_000,
  });
}
