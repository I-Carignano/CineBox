// Layout general (DISENO §4). Se monta una sola vez; al navegar solo cambia lo que renderiza <Outlet />.
// - Desktop (>= 768 px): barra superior fija con la marca, Inicio · Descubrir · ¿Qué veo hoy? · Comunidad,
//   buscador (input desde 1024 px; entre 768 y 1024, ícono) y avatar con menú (o "Ingresar").
// - Mobile: header con la marca, botón de buscar y avatar (Cerrar sesión y Admin tienen que seguir a mano),
//   más una barra inferior fija con 5 íconos: Inicio · Buscar · Qué veo · Comunidad · Perfil.
// Las NavLink ponen aria-current="page" solas en la activa.
import { useState, type ComponentType, type FormEvent } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { Footer } from "../components/Footer";
import { UserMenu } from "../components/UserMenu";
import { buttonClasses } from "../components/ui/button-classes";
import {
  CompassIcon,
  HomeIcon,
  SearchIcon,
  SparklesIcon,
  UserIcon,
  UsersIcon,
} from "../components/ui/icons";
import { signOut, useSession } from "../lib/auth-client";

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

// Inicio es el catálogo actual (/peliculas). El resto, por ahora, son páginas "Próximamente".
const TOP_ITEMS: NavItem[] = [
  { to: "/peliculas", label: "Inicio", icon: HomeIcon },
  { to: "/descubrir", label: "Descubrir", icon: CompassIcon },
  { to: "/que-veo-hoy", label: "¿Qué veo hoy?", icon: SparklesIcon },
  { to: "/comunidad", label: "Comunidad", icon: UsersIcon },
];

// Perfil sin sesión cae en ProtectedRoute: va a /login y después vuelve a /perfil.
const BOTTOM_ITEMS: NavItem[] = [
  { to: "/peliculas", label: "Inicio", icon: HomeIcon },
  { to: "/buscar", label: "Buscar", icon: SearchIcon },
  { to: "/que-veo-hoy", label: "Qué veo", icon: SparklesIcon },
  { to: "/comunidad", label: "Comunidad", icon: UsersIcon },
  { to: "/perfil", label: "Perfil", icon: UserIcon },
];

const topLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-gold-soft text-gold" : "text-muted hover:bg-surface-2 hover:text-text"
  }`;

const bottomLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center gap-0.5 rounded-lg py-2 text-[11px] font-medium transition ${
    isActive ? "text-gold" : "text-muted hover:text-text"
  }`;

export const Layout = () => {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

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

  // Por ahora el buscador solo navega a /buscar?q=... (página "Próximamente" hasta F3).
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/buscar?q=${encodeURIComponent(q)}` : "/buscar");
  };

  return (
    // Padding inferior en mobile: ni el contenido ni el footer quedan tapados por la barra inferior.
    <div className="flex min-h-screen flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          {/* Marca: claqueta (decorativa, alt vacío) + wordmark en texto HTML, nítido a cualquier tamaño.
              El nombre accesible del link lo da aria-label. */}
          <Link
            to="/"
            aria-label="CineBox, ir al inicio"
            className="flex shrink-0 items-center gap-2 rounded"
          >
            <img
              src="/brand/icon-clapper.png"
              alt=""
              width={34}
              height={32}
              className="h-8 w-auto"
            />
            <span className="font-display text-xl font-bold">
              Cine<span className="text-gold">Box</span>
            </span>
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
            {TOP_ITEMS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={topLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <form role="search" onSubmit={handleSearch} className="relative hidden lg:block">
              <label htmlFor="header-search" className="sr-only">
                Buscar películas y series
              </label>
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                id="header-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar..."
                className="w-56 rounded-lg border border-border bg-surface-2 py-2 pr-3 pl-9 text-sm xl:w-64"
              />
            </form>

            <Link
              to="/buscar"
              aria-label="Buscar"
              className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-text lg:hidden"
            >
              <SearchIcon />
            </Link>

            {/* Mientras isPending no se muestra ni avatar ni "Ingresar": evita el parpadeo al recargar. */}
            {user && <UserMenu user={user} onLogout={handleLogout} />}
            {!isPending && !user && (
              <Link to="/login" className={buttonClasses("primary", "sm")}>
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </header>

      {logoutError && (
        <p role="alert" className="bg-danger/10 px-4 py-2 text-center text-sm text-red-300">
          {logoutError}
        </p>
      )}

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6 sm:py-6">
        <Outlet />
      </main>
      <Footer />

      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-5">
          {BOTTOM_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink to={to} className={bottomLinkClass}>
                <Icon className="size-6" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
