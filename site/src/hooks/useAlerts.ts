import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { alertApi } from "@/lib/proxy";

export function useAlerts(workspace?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["alerts", workspace ?? "global"];

  const { data: alerts = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => alertApi.list({ workspace, unread: false }),
    refetchInterval: 30_000,
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

  return {
    alerts,
    unreadCount,
    isLoading,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    isMarkingAll: markAllReadMutation.isPending,
  };
}
