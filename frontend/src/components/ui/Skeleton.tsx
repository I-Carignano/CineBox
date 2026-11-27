// Bloque gris que late mientras algo carga. Es decorativo (aria-hidden): el "Cargando..." para lectores
// de pantalla lo pone quien lo usa, con un role="status". Sin animación si el sistema pide menos movimiento.
interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div
    aria-hidden="true"
    className={`rounded-md bg-surface-2 motion-safe:animate-pulse ${className}`}
  />
);
