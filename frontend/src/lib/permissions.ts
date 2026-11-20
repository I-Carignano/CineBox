// Mismos roles que backend/src/lib/permissions.ts (Better Auth pide que cliente y servidor los conozcan, y
// el front no puede importar del back). Acá solo sirven para que el cliente acepte "superadmin" como rol
// en setRole: el permiso REAL lo decide y lo aplica el backend.
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const ac = createAccessControl(defaultStatements);

export const roles = {
  superadmin: ac.newRole(adminAc.statements),
  admin: ac.newRole({ user: ["list", "set-role", "ban", "delete"] }),
  user: ac.newRole({ user: [] }),
};
