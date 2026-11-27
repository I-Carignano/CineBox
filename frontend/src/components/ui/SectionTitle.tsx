// Título de sección (DISENO §5): barra vertical dorada a la izquierda y, opcional, "Ver todo →" en dorado.
import { Link } from "react-router";

interface SectionTitleProps {
  title: string;
  // Destino del link "Ver todo"; sin él no se muestra.
  to?: string;
  linkLabel?: string;
}

export const SectionTitle = ({ title, to, linkLabel = "Ver todo" }: SectionTitleProps) => (
  <div className="flex items-center justify-between gap-3">
    <h2 className="border-l-4 border-gold pl-3 text-xl font-semibold">{title}</h2>
    {to && (
      <Link to={to} className="rounded text-sm font-medium text-gold hover:underline">
        {linkLabel} <span aria-hidden="true">→</span>
      </Link>
    )}
  </div>
);
