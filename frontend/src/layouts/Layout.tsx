// Layout general: header con la marca CineBox, navegación, usuario y logout, y footer. Se monta una sola vez;
// al navegar solo cambia lo que renderiza <Outlet />.
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { Footer } from "../components/Footer";
import { signOut, useSession } from "../lib/auth-client";
import { isAdminRole } from "../lib/roles";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-1.5 text-sm hover:bg-surface-2 ${isActive ? "bg-gold-soft font-semibold text-gold" : ""}`;

export const Layout = () => {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const [logoutError, setLogoutError] = useState<string | null>(null);

  // signOut borra la sesión EN LA BASE (no solo la cookie). Después va al inicio ("/", que muestra el catálogo),
  // como pide la consigna. Recarga completa en vez de navigate(): arranca de cero el estado de useSession (con
  // navigate() se vería un instante la sesión vieja) y la caché de RTK Query, así no queda nada del usuario.
  // replace: "atrás" no vuelve a la pantalla privada en la que estaba.
  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      setLogoutError(error.message ?? "No se pudo cerrar la sesión");
      return;
    }
    window.location.replace("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-surface px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
          {/* Marca: claqueta (decorativa, alt vacío) + wordmark en texto HTML, nítido a cualquier tamaño.
              El nombre accesible del link lo da aria-label. */}
          <Link to="/" aria-label="CineBox, ir al inicio" className="flex items-center gap-2 rounded">
            <img src="/brand/icon-clapper.png" alt="" width={34} height={32} className="h-8 w-auto" />
            <span className="font-display text-xl font-bold">
              Cine<span className="text-gold">Box</span>
            </span>
          </Link>
          <nav aria-label="Principal" className="flex flex-wrap items-center gap-1">
            <NavLink to="/peliculas" className={navLinkClass}>
              Catálogo
            </NavLink>
            {user && (
              <NavLink to="/perfil" className={navLinkClass}>
                Perfil
              </NavLink>
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
                className="rounded px-3 py-1.5 text-sm hover:bg-surface-2"
              >
                Salir ({user.name})
              </button>
            )}
          </nav>
        </div>
      </header>
      {logoutError && (
        <p role="alert" className="bg-danger/10 px-4 py-2 text-center text-sm text-red-300">
          {logoutError}
        </p>
      )}
      <main className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
