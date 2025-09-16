// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { isRole, type Role } from "@/types/role";

type Props = {
  allowedRoles?: Role[];
  redirectTo?: string;
  children?: React.ReactNode;
};

export default function ProtectedRoute({
  allowedRoles,
  redirectTo = "/signin",
  children,
}: Props) {
  const { user } = useAuth();

  if (!user) return <Navigate to={redirectTo} replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    // Runtime guard → compile-time narrowing
    const role: Role = isRole(user.role) ? user.role : "user";
    if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
