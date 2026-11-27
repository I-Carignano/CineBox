// Cinco estrellas con medias (de a 0,5). Solo lectura por defecto; con onChange es interactiva:
// un slider accesible (flechas ±0,5, Inicio = 0, Fin = 5) y clic en la mitad izquierda o derecha de cada estrella.
import type { KeyboardEvent, MouseEvent } from "react";

interface StarsProps {
  // 0 a 5, de a 0,5 (se redondea a la media más cercana)
  value: number;
  onChange?: (value: number) => void;
  // Nombre accesible del control interactivo (ej.: "Tu calificación")
  label?: string;
  size?: "sm" | "md";
}

const STAR_PATH =
  "M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96z";

const clampHalf = (value: number) => Math.min(5, Math.max(0, Math.round(value * 2) / 2));
const describe = (value: number) => `${value.toLocaleString("es-AR")} de 5 estrellas`;

const Star = ({ fill, sizeClass }: { fill: number; sizeClass: string }) => (
  <span className={`relative inline-block shrink-0 ${sizeClass}`}>
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`absolute inset-0 text-border ${sizeClass}`}
    >
      <path d={STAR_PATH} fill="currentColor" />
    </svg>
    {/* Parte dorada recortada al 0, 50 o 100 % del ancho */}
    <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
      <svg viewBox="0 0 24 24" aria-hidden="true" className={`text-gold ${sizeClass}`}>
        <path d={STAR_PATH} fill="currentColor" />
      </svg>
    </span>
  </span>
);

export const Stars = ({ value, onChange, label = "Calificación", size = "md" }: StarsProps) => {
  const current = clampHalf(value);
  const sizeClass = size === "sm" ? "size-4" : "size-6";
  const stars = [1, 2, 3, 4, 5].map((position) => ({
    position,
    fill: Math.min(1, Math.max(0, current - (position - 1))),
  }));

  if (!onChange) {
    return (
      <span role="img" aria-label={describe(current)} className="inline-flex gap-0.5">
        {stars.map(({ position, fill }) => (
          <Star key={position} fill={fill} sizeClass={sizeClass} />
        ))}
      </span>
    );
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next: Record<string, number> = {
      ArrowRight: current + 0.5,
      ArrowUp: current + 0.5,
      ArrowLeft: current - 0.5,
      ArrowDown: current - 0.5,
      Home: 0,
      End: 5,
    };
    if (event.key in next) {
      event.preventDefault();
      onChange(clampHalf(next[event.key]));
    }
  };

  // Mitad izquierda de la estrella = media; derecha = entera.
  const handleClick = (event: MouseEvent<HTMLSpanElement>, position: number) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const isLeftHalf = event.clientX - rect.left < rect.width / 2;
    onChange(isLeftHalf ? position - 0.5 : position);
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={5}
      aria-valuenow={current}
      aria-valuetext={describe(current)}
      onKeyDown={handleKeyDown}
      className="inline-flex cursor-pointer gap-0.5 rounded"
    >
      {stars.map(({ position, fill }) => (
        <span key={position} onClick={(event) => handleClick(event, position)}>
          <Star fill={fill} sizeClass={sizeClass} />
        </span>
      ))}
    </div>
  );
};
