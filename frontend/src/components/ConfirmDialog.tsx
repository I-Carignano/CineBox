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
  // true = botón rojo (acciones destructivas).
  danger?: boolean;
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
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Modal title={title} onClose={onCancel} dismissible={!busy}>
    <p className="text-slate-700">{message}</p>

    {summary && (
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded bg-slate-50 p-3 text-sm">
        {summary.map(({ label, value }) => (
          <div key={label} className="contents">
            <dt className="text-slate-500">{label}</dt>
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
        className="rounded border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={busy}
        className={`rounded px-4 py-2 font-medium text-white transition disabled:opacity-50 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700"}`}
      >
        {busy ? busyLabel : confirmLabel}
      </button>
    </div>
  </Modal>
);
