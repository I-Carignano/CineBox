// Clases del botón base (DISENO §5), separadas del componente para poder usarlas también en un <Link>
// que se ve como botón (ej.: "Crear cuenta" o "Volver al inicio").
export type ButtonVariant = "primary" | "secondary" | "danger" | "warning";
export type ButtonSize = "sm" | "md";

// Cada variante lleva su color de texto: blanco sobre el rojo danger no llega a 4.5:1, el fondo oscuro sí.
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-gold text-on-gold hover:bg-gold-hover",
  secondary: "border border-border bg-white/5 text-text hover:bg-white/10",
  danger: "bg-danger text-bg hover:bg-red-400",
  warning: "bg-amber-700 text-white hover:bg-amber-800",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
};

export const buttonClasses = (
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
): string =>
  `inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
