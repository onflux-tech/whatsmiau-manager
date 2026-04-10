import type { ReactNode } from "react";
import { PlaygroundAuthContext, usePlaygroundAuthValue } from "./use-playground-auth";

export function PlaygroundAuthProvider({ children }: { children: ReactNode }) {
  const value = usePlaygroundAuthValue();
  return <PlaygroundAuthContext.Provider value={value}>{children}</PlaygroundAuthContext.Provider>;
}
