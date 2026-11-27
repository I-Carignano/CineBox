// Póster (DISENO §5): 2:3, radio de 10 px y, opcional, badge de puntaje arriba a la derecha
// (★ dorado sobre negro al 75 %). Si no hay imagen o no carga, muestra un placeholder con un texto
// (ej.: el género). El ancho lo decide quien lo usa con className.
import { useState } from "react";

interface PosterProps {
  title: string;
  src?: string;
  // Texto del placeholder cuando no hay imagen
  placeholder?: string;
  // Puntaje de 0 a 10; sin él no hay badge
  score?: number;
  className?: string;
}

export const Poster = ({ title, src, placeholder, score, className = "" }: PosterProps) => {
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;

  return (
    <div
      className={`relative aspect-[2/3] overflow-hidden rounded-[10px] bg-surface-2 ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={`Póster de ${title}`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={`Sin póster de ${title}`}
          className="flex size-full flex-col items-center justify-center gap-1 p-2 text-center"
        >
          <span className="text-3xl" aria-hidden="true">
            🎬
          </span>
          {placeholder && <span className="text-xs text-muted">{placeholder}</span>}
        </div>
      )}
      {score !== undefined && (
        <span className="absolute top-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-gold">
          <span aria-hidden="true">★</span> {score.toFixed(1)}
          <span className="sr-only"> de 10</span>
        </span>
      )}
    </div>
  );
};
