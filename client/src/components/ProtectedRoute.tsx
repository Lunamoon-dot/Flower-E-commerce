import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"

interface ProtectedRouteProps {
  requireAdmin?: boolean
  redirectTo?: string
}

export function ProtectedRoute({
  requireAdmin = false,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, token, isInitializing } = useAuthStore()

  // Wait for auth initialization (e.g., fetching user from token on refresh)
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f14]">
        <div className="size-8 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
      </div>
    )
  }

  if (!token || !user) {
    return <Navigate to={redirectTo} replace />
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
