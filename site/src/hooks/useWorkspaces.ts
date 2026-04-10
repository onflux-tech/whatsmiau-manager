import { useQuery } from "@tanstack/react-query";
import pb from "@/lib/pocketbase";
import type { Workspace } from "@/lib/types";
import { useRealtime } from "./useRealtime";

export function useWorkspaces() {
  const result = useQuery({
    queryKey: ["workspaces"],
    queryFn: () =>
      pb.collection("workspaces").getFullList<Workspace>({
        sort: "order,name",
        fields: "id,name,url,icon,order,created,updated",
      }),
  });

  useRealtime("workspaces", ["workspaces"]);

  return result;
}
