// Page: ruta pública "/peliculas/:id". El id sale de la URL con useParams.
import { skipToken } from "@reduxjs/toolkit/query";
import { Link, useLocation, useParams } from "react-router";
import { CopyId } from "../components/CopyId";
import { Card } from "../components/ui/Card";
import { Chip } from "../components/ui/Chip";
import { ErrorState } from "../components/ui/ErrorState";
import { Poster } from "../components/ui/Poster";
import { Skeleton } from "../components/ui/Skeleton";
import { Stars } from "../components/ui/Stars";
import { getErrorMessage, getErrorStatus } from "../lib/api";
import { formatAuthor, formatDate, formatDuration } from "../lib/format";
import { GENRE_LABELS } from "../lib/movies";
import { useGetMovieByIdQuery } from "../store/moviesApi";
import { NotFound } from "./NotFound";

// Esqueleto con la misma forma que el detalle (póster a la izquierda, datos a la derecha).
const MovieDetailSkeleton = () => (
  <Card>
    <p role="status" className="sr-only">
      Cargando película...
    </p>
    <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
      <Skeleton className="aspect-[2/3] w-full max-w-56 rounded-[10px]" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="mt-2 h-20 w-full" />
      </div>
    </div>
  </Card>
);

export const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  // "Volver" conserva los filtros del listado si se venía desde ahí (los manda MovieCard en el state).
  const listSearch = (location.state as { listSearch?: string } | null)?.listSearch ?? "";
  const backLink = (
    <Link to={`/peliculas${listSearch}`} className="self-start text-sm text-muted underline">
      ← Volver al catálogo
    </Link>
  );

  // Cada id es una entrada distinta en la caché. skipToken = no pedir nada si no hay id.
  const {
    data: movie,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMovieByIdQuery(id ?? skipToken);

  if (isLoading) {
    return (
      <section className="flex flex-col gap-4">
        {backLink}
        <MovieDetailSkeleton />
      </section>
    );
  }

  // 404 (no existe o está dada de baja: el backend solo se la muestra al admin) o 400 (id mal formado):
  // para quien navega es una dirección que no existe, así que se muestra el 404 de la app.
  const status = getErrorStatus(error);
  if (status === 404 || status === 400) {
    return <NotFound />;
  }

  if (error || !movie) {
    return (
      <section className="flex flex-col gap-4">
        {backLink}
        <ErrorState
          title="No se pudo cargar la película"
          message={getErrorMessage(error)}
          onRetry={refetch}
          retrying={isFetching}
        />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {backLink}
      <Card as="article" className="flex flex-col gap-4">
        {/* Primera línea de la tarjeta, antes del póster y el título. */}
        <CopyId id={movie._id} />
        <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
          <Poster
            title={movie.title}
            src={movie.posterUrl}
            placeholder={GENRE_LABELS[movie.genre]}
            className="w-full max-w-56 self-start"
          />
          <div>
            {/* Solo un admin recibe una película inactiva (para el resto es 404): se avisa que no es pública. */}
            {!movie.active && (
              <p
                role="status"
                className="mb-2 inline-block rounded bg-amber-500/15 px-2 py-0.5 text-sm font-medium text-amber-300"
              >
                Inactiva: no aparece en el catálogo público
              </p>
            )}
            <h2 className="text-2xl font-semibold">{movie.title}</h2>
            <p className="text-muted">Dirigida por {movie.director}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <Chip>{GENRE_LABELS[movie.genre]}</Chip>
              {/* El puntaje va de 0 a 10: las estrellas lo muestran en la escala de 5 (de a media). */}
              <span className="flex items-center gap-2">
                <Stars value={movie.rating / 2} size="sm" />
                <span className="font-semibold text-gold">
                  {movie.rating.toFixed(1)}
                  <span className="sr-only"> de 10</span>
                </span>
              </span>
              <span className={movie.available ? "text-success" : "text-muted"}>
                {movie.available ? "Disponible" : "No disponible"}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted">Estreno</dt>
              <dd>{formatDate(movie.releaseDate)}</dd>
              <dt className="text-muted">Duración</dt>
              <dd>{formatDuration(movie.durationMinutes)}</dd>
              <dt className="text-muted">Cargada por</dt>
              <dd>{formatAuthor(movie.author)}</dd>
            </dl>

            <h3 className="mt-5 text-sm font-semibold text-text">Sinopsis</h3>
            <p className="mt-1 text-text">{movie.synopsis || "Esta película no tiene sinopsis."}</p>
          </div>
        </div>
      </Card>
    </section>
  );
};
