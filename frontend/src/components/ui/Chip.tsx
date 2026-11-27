// Chip en forma de pill. Activo = dorado lleno. Con onClick es un botón que se puede alternar
// (aria-pressed); sin onClick es una etiqueta de solo lectura (ej.: el género en el detalle).
import type { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const chipClass = (active: boolean) =>
  `inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
    active ? "bg-gold text-on-gold" : "border border-border bg-surface-2 text-text"
  }`;

export const Chip = ({ children, active = false, onClick }: ChipProps) => {
  if (!onClick) {
    return <span className={chipClass(active)}>{children}</span>;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${chipClass(active)} transition ${active ? "hover:bg-gold-hover" : "hover:border-gold"}`}
    >
      {children}
    </button>
  );
};
