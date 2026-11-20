// Envuelve TODAS las rutas (menos /completar-perfil): si hay sesión y el usuario no tiene nombre de usuario
// (cuentas de GitHub/Google que todavía no lo eligieron), lo manda a /completar-perfil. No se puede navegar
// a ningún otro lado hasta completarlo; ahí solo queda la opción de cerrar sesión.
// Mientras la sesión carga no se bloquea nada (así el catálogo público no espera): si resulta que falta el
// username, el redirect ocurre apenas responde get-session.
import { Navigate, Outlet } from "react-router";
import { useSession } from "../lib/auth-client";

export const ProfileGate = () => {
  const { data: session, isPending } = useSession();

  if (!isPending && session && !session.user.username) {
    return <Navigate to="/completar-perfil" replace />;
  }

  return <Outlet />;
};
