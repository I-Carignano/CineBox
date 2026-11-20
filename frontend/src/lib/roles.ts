// Roles de la app: helpers para no repetir "admin || superadmin" en cada pantalla.
import type { UserRole } from "../types/auth";

// Pueden entrar a /admin y editar todas las películas.
export const ADMIN_ROLES: UserRole[] = ["admin", "superadmin"];

export const isAdminRole = (role: string | null | undefined): boolean =>
  !!role && ADMIN_ROLES.includes(role as UserRole);

export const ROLE_LABELS: Record<UserRole, string> = {
  user: "Usuario",
  admin: "Administrador",
  superadmin: "Superadmin",
};

// Un rol que no conocemos se muestra como "Usuario" (igual que lo trata el backend).
export const roleLabel = (role: string | null | undefined): string =>
  ROLE_LABELS[(role as UserRole) in ROLE_LABELS ? (role as UserRole) : "user"];
