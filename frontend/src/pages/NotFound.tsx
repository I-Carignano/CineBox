import { Link } from "react-router";

export const NotFound = () => {
  return (
    <section className="py-10 text-center">
      <h2 className="text-2xl font-semibold">404 — Página no encontrada</h2>
      <p className="mt-2 text-muted">La dirección que buscás no existe.</p>
      <Link to="/peliculas" className="mt-4 inline-block text-gold underline">
        Volver al catálogo
      </Link>
    </section>
  );
};
