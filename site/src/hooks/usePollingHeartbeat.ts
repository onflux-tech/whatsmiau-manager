import { useEffect, useRef } from "react";
import pb from "@/lib/pocketbase";

export function usePollingHeartbeat(wid: string, tier: "fast" | "normal") {
  const tierRef = useRef(tier);
  tierRef.current = tier;

  useEffect(() => {
    if (!wid || !pb.authStore.isValid) return;

    const send = () =>
      pb
        .send("/api/polling/heartbeat", {
          method: "POST",
          body: { workspace: wid, tier: tierRef.current },
        })
        .catch(() => {});

    send();
    const id = setInterval(send, 30_000);
    return () => clearInterval(id);
  }, [wid]);
}
