import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Toaster } from "@/components/ui/sonner";
import { VersionBadge } from "@/components/ui/version-badge";
import { WorkspaceSelector } from "@/components/workspace/WorkspaceSelector";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { LoginPage } from "@/features/auth/LoginPage";

const DocsPage = lazy(() => import("@/features/docs/components"));

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<AuthGuard />}>
          <Route path="/" element={<WorkspaceSelector />} />
          <Route path="/w/:wid" element={<WorkspaceShell />} />
          <Route
            path="/docs"
            element={
              <Suspense>
                <DocsPage />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
      <VersionBadge />
    </>
  );
}
