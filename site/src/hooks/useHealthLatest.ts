import { useQuery } from "@tanstack/react-query";
import pb from "@/lib/pocketbase";
import type { HealthCheck } from "@/lib/types";
import { useRealtime } from "./useRealtime";

const QUERY_KEY = ["health-latest"];

export function useHealthLatest() {
  useRealtime("health_checks", QUERY_KEY);

  return useQuery({
    queryKey: QUERY_KEY,
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
    refetchInterval: 5 * 60_000,
  });
}
