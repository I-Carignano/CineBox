// Confirmación sobre el Modal (estilo MessageBox): pregunta, un resumen opcional de lo que se va a tocar
// y dos botones. Reemplaza a todas las confirmaciones inline.
import type { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./ui/Button";

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
      <Button variant="secondary" onClick={onCancel} disabled={busy}>
        Cancelar
      </Button>
      <Button
        variant={danger ? "danger" : warning ? "warning" : "primary"}
        onClick={onConfirm}
        loading={busy}
      >
        {busy ? busyLabel : confirmLabel}
      </Button>
    </div>
  </Modal>
);
