import { createContext, useContext, useMemo } from "react";
import pb from "@/lib/pocketbase";

type AuthMode = "session" | null;

export interface PlaygroundAuthCtx {
  isAuthorized: boolean;
  authMode: AuthMode;
  authHeaders: Record<string, string>;
}

export const PlaygroundAuthContext = createContext<PlaygroundAuthCtx | null>(null);

export function usePlaygroundAuth(): PlaygroundAuthCtx {
  const ctx = useContext(PlaygroundAuthContext);
  if (!ctx) throw new Error("usePlaygroundAuth must be used within PlaygroundAuthProvider");
  return ctx;
}

export function usePlaygroundAuthValue(): PlaygroundAuthCtx {
  return useMemo(() => {
    const isValid = pb.authStore.isValid;
    const authMode: AuthMode = isValid ? "session" : null;
    const authHeaders: Record<string, string> = {};

    if (isValid && pb.authStore.token) {
      authHeaders.Authorization = pb.authStore.token;
    }

    return { isAuthorized: isValid, authMode, authHeaders };
  }, []);
}
