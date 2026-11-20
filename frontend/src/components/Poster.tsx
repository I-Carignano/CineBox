// Póster de una película. Si no tiene URL o la imagen no carga, muestra un placeholder con el género.
import { useState } from "react";
import { GENRE_LABELS } from "../lib/movies";
import type { Movie } from "../types/movie";

interface PosterProps {
  movie: Pick<Movie, "title" | "genre" | "posterUrl">;
  className?: string;
}

export const Poster = ({ movie, className = "" }: PosterProps) => {
  const [failed, setFailed] = useState(false);

  if (!movie.posterUrl || failed) {
    return (
      <div
        role="img"
        aria-label={`Sin póster de ${movie.title}`}
        className={`flex flex-col items-center justify-center gap-1 bg-ink p-2 text-center text-white ${className}`}
      >
        <span className="text-3xl">🎬</span>
        <span className="text-xs text-white/70">{GENRE_LABELS[movie.genre]}</span>
      </div>
    );
  }

  return (
    <img
      src={movie.posterUrl}
      alt={`Póster de ${movie.title}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
};
