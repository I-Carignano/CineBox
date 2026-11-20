// Contenedor de las pantallas de login y registro: van fuera del Layout, así que arman su propio fondo.
import type { ReactNode } from "react";
import { Link } from "react-router";

export const AuthCard = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-50 p-4 font-sans">
      <section className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold text-slate-900">{title}</h1>
        {children}
        <p className="mt-4 text-center text-sm">
          <Link to="/peliculas" className="text-slate-500 underline">
            Volver al catálogo
          </Link>
        </p>
      </section>
    </main>
  );
};
