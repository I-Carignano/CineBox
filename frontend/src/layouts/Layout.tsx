// Layout general: header con navegación, usuario y logout. Se monta una sola vez;
// al navegar solo cambia lo que renderiza <Outlet />.
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { signOut, useSession } from "../lib/auth-client";
import { isAdminRole } from "../lib/roles";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-1.5 text-sm hover:bg-white/10 ${isActive ? "bg-white/15 font-semibold" : ""}`;

export const Layout = () => {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const [logoutError, setLogoutError] = useState<string | null>(null);

  // signOut borra la sesión EN LA BASE (no solo la cookie).
  // Recarga completa en vez de navigate(): useSession se refresca async y con navigate() el Login
  // todavía vería la sesión vieja. La recarga también limpia la caché de RTK Query.
  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      setLogoutError(error.message ?? "No se pudo cerrar la sesión");
      return;
    }
    window.location.replace("/login");
  };

  return (
    <div className="min-h-screen bg-brand-50 font-sans text-slate-900">
      <header className="bg-ink px-4 py-3 text-white sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
          <Link to="/peliculas" className="text-xl font-bold tracking-tight">
            🎬 Películas
          </Link>
          <nav aria-label="Principal" className="flex flex-wrap items-center gap-1">
            <NavLink to="/peliculas" className={navLinkClass}>
              Catálogo
            </NavLink>
            {user && (
              <>
                <NavLink to="/mis-peliculas" className={navLinkClass}>
                  Mis películas
                </NavLink>
                <NavLink to="/perfil" className={navLinkClass}>
                  Perfil
                </NavLink>
              </>
            )}
            {isAdminRole(user?.role) && (
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
            )}
            {/* Mientras isPending no se muestra ni "Ingresar" ni "Salir": evita el parpadeo al recargar. */}
            {!isPending && !user && (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Ingresar
                </NavLink>
                <NavLink to="/register" className={navLinkClass}>
                  Registrarse
                </NavLink>
              </>
            )}
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded px-3 py-1.5 text-sm hover:bg-white/10"
              >
                Salir ({user.name})
              </button>
            )}
          </nav>
        </div>
      </header>
      {logoutError && (
        <p role="alert" className="bg-red-100 px-4 py-2 text-center text-sm text-red-800">
          {logoutError}
        </p>
      )}
      <main className="mx-auto max-w-5xl p-4 sm:p-6">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-5xl px-4 pb-6 text-center text-sm text-slate-500 sm:px-6">
        <Link to="/privacidad" className="underline hover:text-slate-700">
          Privacidad
        </Link>
      </footer>
    </div>
  );
};
