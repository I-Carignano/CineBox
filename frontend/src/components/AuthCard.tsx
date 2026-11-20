// Contenedor de las pantallas de login y registro: van fuera del Layout, así que arman su propio fondo.
// Logo arriba de la tarjeta y footer abajo (pegado al fondo de la ventana).
import type { ReactNode } from "react";
import { Link } from "react-router";
import { Footer } from "./Footer";

export const AuthCard = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col bg-brand-50 font-sans">
      <main className="flex flex-1 flex-col items-center justify-center gap-5 p-4">
        <Link to="/peliculas">
          <img src="/cinema24-brand/logo-cinema24.png" alt="Cinema 24" className="h-14 w-auto" />
        </Link>
        <section className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-xl font-semibold text-slate-900">{title}</h1>
          {children}
          <p className="mt-4 text-center text-sm">
            <Link to="/peliculas" className="text-slate-600 underline">
              Volver al catálogo
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};
