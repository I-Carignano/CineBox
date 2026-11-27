// Estado de error (DISENO §5): mensaje y "Reintentar" (llama a refetch de RTK Query).
// Nunca un "No pudimos cargar…" sin salida.
import { Button } from "./Button";
import { AlertIcon } from "./icons";

interface ErrorStateProps {
  title?: string;
  // Detalle del error (normalmente el mensaje del backend)
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export const ErrorState = ({
  title = "No se pudo cargar",
  message,
  onRetry,
  retrying = false,
}: ErrorStateProps) => (
  <div
    role="alert"
    className="flex flex-col items-center gap-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-8 text-center"
  >
    <AlertIcon className="size-8 text-red-300" />
    <p className="font-medium text-red-300">{title}</p>
    <p className="max-w-md text-sm text-text">{message}</p>
    {onRetry && (
      <Button variant="secondary" size="sm" onClick={onRetry} loading={retrying}>
        Reintentar
      </Button>
    )}
  </div>
);
