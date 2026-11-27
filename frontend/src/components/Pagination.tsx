// Paginación simple: Anterior / Siguiente y "Página X de Y". No renderiza nada si hay una sola página.
import { Button } from "./ui/Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-3">
      <Button variant="secondary" size="sm" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        ← Anterior
      </Button>
      <span className="text-sm text-muted" aria-current="page">
        Página {page} de {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        Siguiente →
      </Button>
    </nav>
  );
};
