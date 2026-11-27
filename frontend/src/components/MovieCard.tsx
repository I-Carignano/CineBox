// Presentacional: recibe una película por props, no sabe nada de axios ni de estado.
// Toda la card es un <Link> al detalle; `listSearch` viaja en el state para que "Volver" conserve los filtros.
// El puntaje va en el badge del póster; debajo, título, año · género y disponibilidad.
import { Link } from "react-router";
import { formatYear } from "../lib/format";
import { GENRE_LABELS } from "../lib/movies";
import type { Movie } from "../types/movie";
import { Poster } from "./ui/Poster";
import { Skeleton } from "./ui/Skeleton";

interface MovieCardProps {
  movie: Movie;
  listSearch: string;
}

export const MovieCard = ({ movie, listSearch }: MovieCardProps) => {
  return (
    <Link
      to={`/peliculas/${movie._id}`}
      state={{ listSearch }}
      className="group flex w-full flex-col gap-2 rounded-[10px]"
    >
      <Poster
        title={movie.title}
        src={movie.posterUrl}
        placeholder={GENRE_LABELS[movie.genre]}
        score={movie.rating}
        className="w-full ring-gold transition group-hover:ring-2"
      />
      <article className="flex flex-1 flex-col gap-0.5">
        <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-gold">{movie.title}</h3>
        <p className="text-xs text-muted">
          {formatYear(movie.releaseDate)} · {GENRE_LABELS[movie.genre]}
        </p>
        <p className={`text-xs ${movie.available ? "text-success" : "text-muted"}`}>
          {movie.available ? "Disponible" : "No disponible"}
        </p>
      </article>
    </Link>
  );
};

// Misma forma que la card, para la grilla mientras carga.
export const MovieCardSkeleton = () => (
  <div className="flex w-full flex-col gap-2">
    <Skeleton className="aspect-[2/3] w-full rounded-[10px]" />
    <Skeleton className="h-4 w-4/5" />
    <Skeleton className="h-3 w-1/2" />
  </div>
);
