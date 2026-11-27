// Botón base: variantes primary / secondary / danger / warning, tamaños sm / md y estado de carga.
// Con `loading` queda deshabilitado y muestra un spinner; el texto lo sigue decidiendo quien lo usa
// (ej.: "Guardando..."). Por defecto es type="button": un submit se pide explícitamente.
import type { ButtonHTMLAttributes } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./button-classes";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={buttonClasses(variant, size, className)}
    {...rest}
  >
    {loading && (
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
      />
    )}
    {children}
  </button>
);
