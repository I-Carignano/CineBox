// Campo de formulario reutilizable: label + input + mensaje de error accesible.
// Se usa con React Hook Form: <FormField label="Email" error={errors.email?.message} {...register("email")} />
import { useId, type ComponentProps } from "react";

type FormFieldProps = ComponentProps<"input"> & { label: string; error?: string };

export const FormField = ({ label, error, ...inputProps }: FormFieldProps) => {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1 text-sm text-text">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
        className="rounded border border-border bg-surface px-3 py-2 aria-invalid:border-danger"
      />
      {error && (
        <span id={errorId} className="text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
};
