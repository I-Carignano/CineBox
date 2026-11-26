// Confirmaciones de baja de una película (DF27), sobre ConfirmDialog. Son dos modales distintos a propósito,
// para que nunca se confunda una baja que se puede deshacer con una que no:
//   "soft"      → baja lógica (botón ámbar): se oculta del catálogo y se puede restaurar desde Inactivas.
//   "permanent" → baja física (botón rojo): se borra de la base para siempre.
import { formatAuthor, formatDate, formatDateTime } from "../lib/format";
import { GENRE_LABELS } from "../lib/movies";
import type { Movie } from "../types/movie";
import { ConfirmDialog } from "./ConfirmDialog";

export type MovieDeleteMode = "soft" | "permanent";

interface MovieDeleteDialogProps {
  mode: MovieDeleteMode;
  movie: Movie;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const MovieDeleteDialog = ({ mode, movie, busy, onConfirm, onCancel }: MovieDeleteDialogProps) => {
  const summary = [
    { label: "Título", value: movie.title },
    { label: "Director", value: movie.director },
    { label: "Género", value: GENRE_LABELS[movie.genre] },
    { label: "Estreno", value: formatDate(movie.releaseDate) },
    { label: "Autor", value: formatAuthor(movie.author) },
  ];

  if (mode === "soft") {
    return (
      <ConfirmDialog
        title="Dar de baja la película"
        message="La película se ocultará del catálogo público. Podés restaurarla desde Inactivas."
        summary={summary}
        confirmLabel="Sí, dar de baja"
        busyLabel="Dando de baja..."
        warning
        busy={busy}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
  }

  return (
    <ConfirmDialog
      title="Eliminar definitivamente"
      message="Se eliminará definitivamente. Esta acción no se puede deshacer."
      summary={
        movie.deletedAt
          ? [...summary, { label: "Dada de baja", value: formatDateTime(movie.deletedAt) }]
          : summary
      }
      confirmLabel="Sí, eliminar definitivamente"
      busyLabel="Eliminando..."
      danger
      busy={busy}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};
