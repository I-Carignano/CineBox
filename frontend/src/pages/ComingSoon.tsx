// Page reutilizable para las secciones del menú que todavía no existen (Descubrir, ¿Qué veo hoy?,
// Comunidad, Buscar): así el menú nunca lleva a un link roto ni a un 404. Cada ruta le pasa su nombre y texto.
import { Link, useSearchParams } from "react-router";
import { Card } from "../components/ui/Card";
import { buttonClasses } from "../components/ui/button-classes";
import { ClockIcon } from "../components/ui/icons";

interface ComingSoonProps {
  section: string;
  description: string;
}

export const ComingSoon = ({ section, description }: ComingSoonProps) => {
  // Desde el buscador del header llega ?q=: se muestra lo que se buscó.
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim();

  return (
    <Card as="section" className="mx-auto flex max-w-lg flex-col items-center gap-3 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-gold-soft text-gold">
        <ClockIcon className="size-6" />
      </span>
      <p className="text-sm font-medium tracking-wide text-gold uppercase">Próximamente</p>
      <h1 className="text-2xl font-semibold">{section}</h1>
      {query && (
        <p className="text-sm text-muted">
          Buscaste: <span className="font-medium text-text">“{query}”</span>
        </p>
      )}
      <p className="text-muted">{description}</p>
      <Link to="/" className={buttonClasses("primary", "md", "mt-2")}>
        Volver al inicio
      </Link>
    </Card>
  );
};
