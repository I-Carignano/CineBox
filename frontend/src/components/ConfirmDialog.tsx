// Confirmación sobre el Modal (estilo MessageBox): pregunta, un resumen opcional de lo que se va a tocar
// y dos botones. Reemplaza a todas las confirmaciones inline.
import type { ReactNode } from "react";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  title: string;
  message: string;
  // Filas "etiqueta: valor" con el resumen del elemento afectado.
  summary?: { label: string; value: ReactNode }[];
  confirmLabel: string;
  busyLabel?: string;
  // true = botón rojo (acciones destructivas, que no se pueden deshacer).
  danger?: boolean;
  // true = botón ámbar (acciones que se pueden deshacer, como una baja lógica). danger tiene prioridad.
  warning?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  title,
  message,
  summary,
  confirmLabel,
  busyLabel = "Procesando...",
  danger = false,
  warning = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Modal title={title} onClose={onCancel} dismissible={!busy}>
    <p className="text-text">{message}</p>

    {summary && (
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded bg-surface-2 p-3 text-sm">
        {summary.map(({ label, value }) => (
          <div key={label} className="contents">
            <dt className="text-muted">{label}</dt>
            <dd className="font-medium break-words">{value}</dd>
          </div>
        ))}
      </dl>
    )}

    <div className="mt-6 flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="rounded border border-border px-4 py-2 text-text transition hover:bg-surface-2 disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={busy}
        // Cada variante lleva su color de texto: blanco sobre el rojo danger no llega a 4.5:1, el fondo oscuro sí.
        className={`rounded px-4 py-2 font-medium transition disabled:opacity-50 ${danger ? "bg-danger text-bg hover:bg-red-400" : warning ? "bg-amber-700 text-white hover:bg-amber-800" : "bg-gold text-on-gold hover:bg-gold-hover"}`}
      >
        {busy ? busyLabel : confirmLabel}
      </button>
    </div>
  </Modal>
);
