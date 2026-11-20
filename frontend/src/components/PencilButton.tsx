// Botón con ícono de lápiz para editar un dato en lectura (abre un modal). El ícono es decorativo:
// el nombre accesible lo da aria-label.
interface PencilButtonProps {
  label: string;
  onClick: () => void;
}

export const PencilButton = ({ label, onClick }: PencilButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="rounded p-1 text-slate-600 transition hover:bg-slate-100 hover:text-brand-600"
  >
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828Z" />
    </svg>
  </button>
);
