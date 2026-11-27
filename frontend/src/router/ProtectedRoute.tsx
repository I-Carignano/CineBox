// Protege un grupo de rutas: sin sesión va a /login; con sesión pero sin el rol pedido, a `redirectTo`.
import { Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "../lib/auth-client";
import type { UserRole } from "../types/auth";

interface ProtectedRouteProps {
  roles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ roles, redirectTo = "/peliculas" }: ProtectedRouteProps) => {
  // isPending: true hasta que responde /api/auth/get-session (así un F5 no rebota a /login).
  const { data: session, isPending } = useSession();
  const location = useLocation();

  if (isPending) {
    return <p className="text-muted">Verificando sesión...</p>;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(session.user.role as UserRole)) {
    // `forbidden` hace que la pantalla de destino (Perfil) muestre el aviso "No tenés permisos".
    return <Navigate to={redirectTo} replace state={{ forbidden: true }} />;
  }

  return <Outlet />;
};
