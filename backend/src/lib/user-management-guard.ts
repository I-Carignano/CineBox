// Hook de Better Auth (hooks.before) que corre antes de los endpoints de gestión de usuarios y agrega dos
// reglas que el control de acceso (lib/permissions.ts) no puede expresar porque dependen del usuario OBJETIVO:
//   1. Nadie puede cambiarse su propio rol (400).
//   2. Un admin solo puede gestionar usuarios con rol "user": si el objetivo es admin o superadmin, 403.
// El superadmin no tiene la regla 2. Si no hay sesión o falta el userId, no se hace nada acá: el endpoint
// responde 401 o 400 por su cuenta.
import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";

const MANAGEMENT_PATHS = [
  "/admin/set-role",
  "/admin/ban-user",
  "/admin/unban-user",
  "/admin/remove-user",
];

export const userManagementGuard = createAuthMiddleware(async (ctx) => {
  if (!MANAGEMENT_PATHS.includes(ctx.path)) return;

  const session = await getSessionFromCtx(ctx);
  const targetId: unknown = ctx.body?.userId;
  if (!session || typeof targetId !== "string") return;

  const caller = session.user;
  const isSelf = targetId === caller.id;

  if (ctx.path === "/admin/set-role" && isSelf) {
    throw APIError.from("BAD_REQUEST", {
      code: "CANNOT_CHANGE_OWN_ROLE",
      message: "No podés cambiarte el rol a vos mismo",
    });
  }

  // Si el admin se apunta a sí mismo, que responda el plugin (400 "no podés darte de baja / eliminarte").
  if (caller.role === "admin" && !isSelf) {
    const target = await ctx.context.internalAdapter.findUserById(targetId);
    const targetRole = (target as { role?: string | null } | null)?.role ?? "user";
    if (target && targetRole !== "user") {
      throw APIError.from("FORBIDDEN", {
        code: "CANNOT_MANAGE_ADMINS",
        message: "Un administrador solo puede gestionar usuarios con rol usuario",
      });
    }
  }
});
