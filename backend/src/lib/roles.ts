// Roles con permisos de administración: escriben el catálogo y ven lo dado de baja (DF08, DF27).
// Lo usan las rutas (requireRole) y los controllers (qué puede ver quien pide).
import type { SessionUser, UserRole } from "../types/auth.types.js";

export const ADMIN_ROLES: UserRole[] = ["admin", "superadmin"];

export function isAdmin(user: SessionUser | undefined): boolean {
  return !!user && ADMIN_ROLES.includes(user.role as UserRole);
}
