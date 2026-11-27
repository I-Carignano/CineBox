// Diálogo modal reutilizable (estilo MessageBox): fondo oscuro que cubre la pantalla, caja centrada.
// Usa el <dialog> nativo con showModal(): el navegador ya se encarga de Escape, del foco dentro de la caja
// y de bloquear lo de atrás. Se cierra con Escape, con click afuera o con el botón Cancelar que ponga el hijo.
// Se monta SOLO mientras está abierto (el padre lo renderiza condicionalmente).
import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  // false mientras hay una operación en curso: Escape y click afuera no cierran.
  dismissible?: boolean;
  size?: "sm" | "lg";
}

export const Modal = ({
  title,
  onClose,
  children,
  dismissible = true,
  size = "sm",
}: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    // Que no se pueda scrollear la página de atrás mientras el modal está abierto.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      // Escape: el navegador dispara "cancel". Se frena para que el cierre lo decida el padre.
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      // El click en el fondo oscuro llega al <dialog> mismo (el contenido está en el div de adentro).
      onClick={(event) => {
        if (event.target === event.currentTarget && dismissible) onClose();
      }}
      className={`m-auto max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto rounded-xl border border-border bg-surface p-0 text-text shadow-xl backdrop:bg-black/70 ${size === "lg" ? "max-w-2xl" : "max-w-md"}`}
    >
      <div className="p-4 sm:p-6">
        <h2 id="modal-title" className="mb-4 text-lg font-semibold">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
};
