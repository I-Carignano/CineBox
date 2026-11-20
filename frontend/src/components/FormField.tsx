// Campo de formulario reutilizable: label + input + mensaje de error accesible.
// Se usa con React Hook Form: <FormField label="Email" error={errors.email?.message} {...register("email")} />
import { useId, type ComponentProps } from "react";

type FormFieldProps = ComponentProps<"input"> & { label: string; error?: string };

export const FormField = ({ label, error, ...inputProps }: FormFieldProps) => {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1 text-sm text-slate-700">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
        className="rounded border border-slate-300 bg-white px-3 py-2 aria-invalid:border-red-500"
      />
      {error && (
        <span id={errorId} className="text-xs text-red-700">
          {error}
        </span>
      )}
    </div>
  );
};
