// Tarjeta única de autenticación (DISENO, captura 00-login): logo, pestañas "Ingresar" / "Crear cuenta",
// el formulario de la pestaña activa y "o continuá con" Google / GitHub. Va fuera del Layout: arma su propio
// fondo, con el footer pegado abajo.
// Pestañas accesibles (patrón tabs de WAI-ARIA): tablist / tab / tabpanel, aria-selected y aria-controls;
// flechas, Inicio y Fin cambian de pestaña (activación automática). Cada pestaña es una URL (/login,
// /register): cambiar actualiza la URL sin recargar y conserva el `state` (a dónde volver después del login).
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Footer } from "./Footer";
import { SocialLogin } from "./SocialLogin";

export type AuthTab = "login" | "register";

const TABS: { id: AuthTab; label: string; path: string; heading: string }[] = [
  { id: "login", label: "Ingresar", path: "/login", heading: "Ingresar a CineBox" },
  {
    id: "register",
    label: "Crear cuenta",
    path: "/register",
    heading: "Crear una cuenta en CineBox",
  },
];

interface AuthCardProps {
  active: AuthTab;
  // A dónde vuelve el login con Google / GitHub
  socialCallbackURL: string;
  // Formulario de la pestaña activa
  children: ReactNode;
}

const tabClass = (selected: boolean) =>
  `rounded-lg py-2 text-sm font-semibold transition ${
    selected ? "bg-gold-soft text-gold" : "text-muted hover:text-text"
  }`;

export const AuthCard = ({ active, socialCallbackURL, children }: AuthCardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const tabRefs = useRef<Partial<Record<AuthTab, HTMLButtonElement | null>>>({});
  const activeIndex = TABS.findIndex((tab) => tab.id === active);

  // replace: cambiar de pestaña no suma entradas al historial ("atrás" sale de la pantalla de ingreso).
  // state: conserva `from` (la ruta protegida desde la que llegó) para volver ahí después del login.
  const selectTab = (index: number) => {
    const tab = TABS[index];
    if (tab.id === active) return;
    navigate(tab.path, { replace: true, state: location.state });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const targets: Record<string, number> = {
      ArrowRight: activeIndex + 1,
      ArrowLeft: activeIndex - 1,
      Home: 0,
      End: TABS.length - 1,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    const next = (targets[event.key] + TABS.length) % TABS.length;
    tabRefs.current[TABS[next].id]?.focus();
    selectTab(next);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-8">
        <Link to="/peliculas" className="rounded">
          <img
            src="/brand/logo-cinebox-dark-bg.png"
            alt="CineBox"
            width={258}
            height={64}
            className="h-16 w-auto"
          />
        </Link>

        <section className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <h1 className="sr-only">{TABS[activeIndex].heading}</h1>

          <div
            role="tablist"
            aria-label="Ingresar o crear cuenta"
            className="grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1"
          >
            {TABS.map((tab) => {
              const selected = tab.id === active;
              return (
                <button
                  key={tab.id}
                  ref={(element) => {
                    tabRefs.current[tab.id] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`auth-tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={`auth-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectTab(TABS.indexOf(tab))}
                  onKeyDown={handleKeyDown}
                  className={tabClass(selected)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Los dos paneles existen (así aria-controls siempre apunta a algo); solo el activo tiene contenido. */}
          {TABS.map((tab) => (
            <div
              key={tab.id}
              role="tabpanel"
              id={`auth-panel-${tab.id}`}
              aria-labelledby={`auth-tab-${tab.id}`}
              hidden={tab.id !== active}
              className="mt-5"
            >
              {tab.id === active && (
                <>
                  {children}
                  <SocialLogin callbackURL={socialCallbackURL} />
                </>
              )}
            </div>
          ))}

          <p className="mt-5 text-center text-sm">
            <Link to="/peliculas" className="text-muted underline hover:text-text">
              Volver al catálogo
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};
