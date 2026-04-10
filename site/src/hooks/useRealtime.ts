import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import pb from "@/lib/pocketbase";

const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function useRealtime(collection: string, queryKey: string[]) {
  const queryClient = useQueryClient();
  const keyRef = useRef(queryKey);
  keyRef.current = queryKey;

  const serialized = queryKey.join(",");

  useEffect(() => {
    if (!pb.authStore.isValid) return;

    const debounceKey = `${collection}:${serialized}`;

    const unsubscribe = pb.collection(collection).subscribe("*", () => {
      const existing = timers.get(debounceKey);
      if (existing) clearTimeout(existing);

      timers.set(
        debounceKey,
        setTimeout(() => {
          timers.delete(debounceKey);
          queryClient.invalidateQueries({ queryKey: keyRef.current }, { cancelRefetch: false });
        }, 500),
      );
    });

    return () => {
      const t = timers.get(debounceKey);
      if (t) {
        clearTimeout(t);
        timers.delete(debounceKey);
      }
      unsubscribe.then((unsub) => unsub());
    };
  }, [collection, queryClient, serialized]);
}
