import { Navigate, Outlet } from "react-router";
import { useAuthGuard } from "@/features/auth/hooks/useAuth";

export function AuthGuard() {
  const { isLoggedIn, isLoading } = useAuthGuard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
