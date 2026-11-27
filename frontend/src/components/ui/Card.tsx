// Tarjeta base: superficie del tema con borde. `as` elige la etiqueta (article, section, div).
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  as?: "div" | "article" | "section";
  className?: string;
}

export const Card = ({ children, as: Tag = "div", className = "" }: CardProps) => (
  <Tag className={`rounded-xl border border-border bg-surface p-4 sm:p-6 ${className}`}>
    {children}
  </Tag>
);
