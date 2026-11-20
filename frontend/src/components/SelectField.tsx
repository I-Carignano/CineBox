// Select reutilizable: label + select + mensaje de error accesible (igual que FormField, pero para <select>).
// Las <option> van como children: <SelectField label="Género" {...register("genre")}><option ...>
import { useId, type ComponentProps } from "react";

type SelectFieldProps = ComponentProps<"select"> & { label: string; error?: string };

export const SelectField = ({ label, error, children, ...selectProps }: SelectFieldProps) => {
  const selectId = useId();
  const errorId = `${selectId}-error`;

  return (
    <div className="flex flex-col gap-1 text-sm text-slate-700">
      <label htmlFor={selectId}>{label}</label>
      <select
        id={selectId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...selectProps}
        className="rounded border border-slate-300 bg-white px-3 py-2 aria-invalid:border-red-500"
      >
        {children}
      </select>
      {error && (
        <span id={errorId} className="text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
};
