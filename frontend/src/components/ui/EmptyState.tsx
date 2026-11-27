// Estado vacío (DISENO §5): ícono, texto que dice qué pasa y, opcional, una acción para salir de ahí.
import type { ReactNode } from "react";
import { FilmIcon } from "./icons";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  // Botón o link para seguir (ej.: "Limpiar filtros")
  action?: ReactNode;
}

export const EmptyState = ({ title, description, icon, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center">
    <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-muted">
      {icon ?? <FilmIcon className="size-6" />}
    </span>
    <p className="font-medium">{title}</p>
    {description && <p className="max-w-md text-sm text-muted">{description}</p>}
    {action}
  </div>
);
