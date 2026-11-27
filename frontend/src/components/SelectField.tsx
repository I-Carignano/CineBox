// Select reutilizable: label + select + mensaje de error accesible (igual que FormField, pero para <select>).
// Las <option> van como children: <SelectField label="Género" {...register("genre")}><option ...>
import { useId, type ComponentProps } from "react";

type SelectFieldProps = ComponentProps<"select"> & { label: string; error?: string };

export const SelectField = ({ label, error, children, ...selectProps }: SelectFieldProps) => {
  const selectId = useId();
  const errorId = `${selectId}-error`;

  return (
    <div className="flex flex-col gap-1 text-sm text-text">
      <label htmlFor={selectId}>{label}</label>
      <select
        id={selectId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...selectProps}
        className="rounded border border-border bg-surface px-3 py-2 aria-invalid:border-danger"
      >
        {children}
      </select>
      {error && (
        <span id={errorId} className="text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
};
