// Presentacional: recibe una película por props, no sabe nada de axios ni de estado.
// Toda la card es un <Link> al detalle; `listSearch` viaja en el state para que "Volver" conserve los filtros.
import { Link } from "react-router";
import { formatYear } from "../lib/format";
import { GENRE_LABELS } from "../lib/movies";
import type { Movie } from "../types/movie";
import { Poster } from "./Poster";

interface MovieCardProps {
  movie: Movie;
  listSearch: string;
}

export const MovieCard = ({ movie, listSearch }: MovieCardProps) => {
  return (
    <Link
      to={`/peliculas/${movie._id}`}
      state={{ listSearch }}
      className="flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <Poster movie={movie} className="aspect-[2/3] w-full" />
      <article className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 font-semibold">{movie.title}</h3>
        <p className="text-xs text-slate-500">
          {formatYear(movie.releaseDate)} · {GENRE_LABELS[movie.genre]}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs">
          <span className="font-semibold text-amber-600">
            <span aria-hidden="true">★</span> {movie.rating.toFixed(1)}
            <span className="sr-only"> de 10</span>
          </span>
          <span className={movie.available ? "text-green-700" : "text-slate-400"}>
            {movie.available ? "Disponible" : "No disponible"}
          </span>
        </div>
      </article>
    </Link>
  );
};
