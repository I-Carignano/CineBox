// Contenedor de las pantallas de login y registro: van fuera del Layout, así que arman su propio fondo.
// Logo arriba de la tarjeta y footer abajo (pegado al fondo de la ventana).
import type { ReactNode } from "react";
import { Link } from "react-router";
import { Footer } from "./Footer";

export const AuthCard = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-5 p-4">
        <Link to="/peliculas">
          <img
            src="/brand/logo-cinebox-dark-bg.png"
            alt="CineBox"
            width={258}
            height={64}
            className="h-16 w-auto"
          />
        </Link>
        <section className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h1 className="mb-4 text-xl font-semibold text-text">{title}</h1>
          {children}
          <p className="mt-4 text-center text-sm">
            <Link to="/peliculas" className="text-muted underline">
              Volver al catálogo
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};
