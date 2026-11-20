// Page: ruta pública "/peliculas/:id". El id sale de la URL con useParams.
import { skipToken } from "@reduxjs/toolkit/query";
import { Link, useLocation, useParams } from "react-router";
import { CopyId } from "../components/CopyId";
import { Poster } from "../components/Poster";
import { getErrorMessage } from "../lib/api";
import { formatAuthor, formatDate, formatDuration } from "../lib/format";
import { GENRE_LABELS } from "../lib/movies";
import { useGetMovieByIdQuery } from "../store/moviesApi";

export const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  // "Volver" conserva los filtros del listado si se venía desde ahí (los manda MovieCard en el state).
  const listSearch = (location.state as { listSearch?: string } | null)?.listSearch ?? "";
  const backLink = (
    <Link to={`/peliculas${listSearch}`} className="text-sm text-slate-500 underline">
      ← Volver al catálogo
    </Link>
  );

  // Cada id es una entrada distinta en la caché. skipToken = no pedir nada si no hay id.
  const { data: movie, isLoading, error } = useGetMovieByIdQuery(id ?? skipToken);

  if (isLoading) {
    return (
      <p role="status" className="text-slate-500">
        Cargando película...
      </p>
    );
  }

  if (error || !movie) {
    return (
      <section className="flex flex-col gap-2">
        <p role="alert" className="text-red-700">
          No se pudo cargar la película: {getErrorMessage(error)}
        </p>
        {backLink}
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {backLink}
      <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {/* Primera línea de la tarjeta, antes del póster y el título. */}
        <CopyId id={movie._id} />
        <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
          <Poster movie={movie} className="aspect-[2/3] w-full max-w-56 self-start rounded-lg" />
          <div>
            <h2 className="text-2xl font-semibold">{movie.title}</h2>
            <p className="text-slate-600">Dirigida por {movie.director}</p>

            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded bg-brand-100 px-2 py-0.5 font-medium text-brand-700">
                {GENRE_LABELS[movie.genre]}
              </span>
              <span className="font-semibold text-amber-600">
                <span aria-hidden="true">★</span> {movie.rating.toFixed(1)}
                <span className="sr-only"> de 10</span>
              </span>
              <span className={movie.available ? "text-green-700" : "text-slate-400"}>
                {movie.available ? "Disponible" : "No disponible"}
              </span>
            </p>

            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-slate-500">Estreno</dt>
              <dd>{formatDate(movie.releaseDate)}</dd>
              <dt className="text-slate-500">Duración</dt>
              <dd>{formatDuration(movie.durationMinutes)}</dd>
              <dt className="text-slate-500">Cargada por</dt>
              <dd>{formatAuthor(movie.author)}</dd>
            </dl>

            <h3 className="mt-5 text-sm font-semibold text-slate-700">Sinopsis</h3>
            <p className="mt-1 text-slate-700">
              {movie.synopsis || "Esta película no tiene sinopsis."}
            </p>
          </div>
        </div>
      </article>
    </section>
  );
};
