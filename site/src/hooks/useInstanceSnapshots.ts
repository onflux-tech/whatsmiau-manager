import { useQuery } from "@tanstack/react-query";
import pb from "@/lib/pocketbase";
import type { InstanceSnapshot } from "@/lib/types";
import { sanitizeId } from "@/lib/utils";
import { useRealtime } from "./useRealtime";

export function useInstanceSnapshots(wid: string) {
  const queryKey = ["instance-snapshots", wid];

  const result = useQuery({
    queryKey,
    queryFn: () =>
      pb.collection("instance_snapshots").getFullList<InstanceSnapshot>({
        filter: `workspace = "${sanitizeId(wid)}"`,
        sort: "name",
      }),
    enabled: !!wid && !!sanitizeId(wid),
  });

  useRealtime("instance_snapshots", queryKey);

  return result;
}
