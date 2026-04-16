import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { alertApi } from "@/lib/proxy";
import { useRealtime } from "./useRealtime";

const QUERY_KEY = ["alerts"];

export function useAlerts(workspace?: string) {
  const queryClient = useQueryClient();
  const queryKey = workspace ? [...QUERY_KEY, workspace] : QUERY_KEY;

  useRealtime("alerts", queryKey);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => alertApi.list({ workspace }),
    refetchInterval: 5 * 60_000,
  });

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => alertApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => alertApi.markAllRead(workspace),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const clearReadMutation = useMutation({
    mutationFn: () => alertApi.clearRead(workspace),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    alerts,
    unreadCount,
    isLoading,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    isMarkingAll: markAllReadMutation.isPending,
    clearRead: clearReadMutation.mutate,
    isClearing: clearReadMutation.isPending,
  };
}
