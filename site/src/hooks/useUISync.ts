import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { useUIStore } from "@/stores/ui";

export function useUISync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedInstance, activeTab, selectInstance } = useUIStore();
  const didRestore = useRef(false);

  // Restore state from URL on mount (once)
  useEffect(() => {
    if (didRestore.current) return;
    didRestore.current = true;
    const instance = searchParams.get("instance");
    const tab = searchParams.get("tab");
    if (instance) {
      selectInstance(instance, tab ?? "connect");
    }
  }, [searchParams, selectInstance]);

  // Sync state to URL when it changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedInstance) {
      params.set("instance", selectedInstance);
      params.set("tab", activeTab);
    } else {
      params.delete("instance");
      params.delete("tab");
    }
    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    if (newSearch !== currentSearch) {
      setSearchParams(params, { replace: true });
    }
  }, [selectedInstance, activeTab, setSearchParams, searchParams]);
}
