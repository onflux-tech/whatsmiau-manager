import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";

let refreshPromise: Promise<void> | null = null;

function ensureRefresh() {
  if (refreshPromise) return refreshPromise;
  if (!pb.authStore.isValid) return Promise.resolve();

  refreshPromise = pb
    .collection("_superusers")
    .authRefresh()
    .catch(() => {
      pb.authStore.clear();
    })
    .then(() => {});
  return refreshPromise;
}

export function useAuthGuard() {
  const [isLoading, setIsLoading] = useState(true);
  const isLoggedIn = pb.authStore.isValid;

  useEffect(() => {
    ensureRefresh().finally(() => setIsLoading(false));
  }, []);

  return { isLoggedIn, isLoading };
}

export function useAuth() {
  const isLoggedIn = pb.authStore.isValid;

  const logout = () => {
    refreshPromise = null;
    pb.authStore.clear();
    window.location.href = "/login";
  };

  return { isLoggedIn, logout };
}
