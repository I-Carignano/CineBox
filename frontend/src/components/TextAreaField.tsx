// Textarea reutilizable: label + textarea + mensaje de error accesible (igual que FormField, pero para texto largo).
import { useId, type ComponentProps } from "react";

type TextAreaFieldProps = ComponentProps<"textarea"> & { label: string; error?: string };

export const TextAreaField = ({ label, error, ...textareaProps }: TextAreaFieldProps) => {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex flex-col gap-1 text-sm text-slate-700">
      <label htmlFor={fieldId}>{label}</label>
      <textarea
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...textareaProps}
        className="rounded border border-slate-300 bg-white px-3 py-2 aria-invalid:border-red-500"
      />
      {error && (
        <span id={errorId} className="text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
};
