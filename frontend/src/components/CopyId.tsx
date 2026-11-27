// Muestra un ID como "ID: #<id>" en letra chica, con un botón que copia el ID solo (sin el "#").
// Sirve para probar la API con curl o Postman.
import { useState } from "react";

export const CopyId = ({ id }: { id: string }) => {
  // "copied" | "error" | null: el aviso vuelve a desaparecer solo.
  const [status, setStatus] = useState<"copied" | "error" | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setStatus("copied");
    } catch {
      // Sin permiso de portapapeles (o sin https): se avisa en vez de fallar en silencio.
      setStatus("error");
    }
    setTimeout(() => setStatus(null), 2000);
  };

  return (
    <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
      <span>
        ID: <span className="font-mono">#{id}</span>
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded border border-border px-2 py-0.5 hover:bg-surface-2"
      >
        Copiar
      </button>
      <span role="status" className={status === "error" ? "text-danger" : "text-success"}>
        {status === "copied" && "¡Copiado!"}
        {status === "error" && "No se pudo copiar"}
      </span>
    </p>
  );
};
