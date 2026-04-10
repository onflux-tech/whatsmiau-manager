import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const mql = window.matchMedia("(min-width: 768px)");
  const mqlLg = window.matchMedia("(min-width: 1024px)");
  mql.addEventListener("change", callback);
  mqlLg.addEventListener("change", callback);
  return () => {
    mql.removeEventListener("change", callback);
    mqlLg.removeEventListener("change", callback);
  };
}

function getSnapshot() {
  const w = window.innerWidth;
  if (w >= 1024) return "desktop" as const;
  if (w >= 768) return "tablet" as const;
  return "mobile" as const;
}

function getServerSnapshot() {
  return "desktop" as const;
}

export function useBreakpoint() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsMobile() {
  return useBreakpoint() === "mobile";
}
