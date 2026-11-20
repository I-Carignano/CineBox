// Control de acceso del plugin admin de Better Auth: qué puede hacer cada rol sobre los USUARIOS.
// Lo aplica Better Auth mismo en cada endpoint /api/auth/admin/*: quien llame a un endpoint sin el permiso
// (curl, Postman) recibe 403. No hace falta chequearlo a mano en nuestro código.
//   superadmin: permisos completos de usuarios (listar, cambiar rol, dar de baja, reactivar, eliminar).
//   admin:      listar, dar de baja / reactivar ("ban") y eliminar ("delete"). NO puede cambiar roles.
//   user:       nada.
// Ojo: el permiso dice QUÉ acciones puede hacer, no SOBRE QUIÉN. Que un admin solo pueda gestionar usuarios
// con rol "user" (y que nadie se cambie su propio rol) lo controla el hook de lib/user-management-guard.ts.
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const ac = createAccessControl(defaultStatements);

export const roles = {
  superadmin: ac.newRole(adminAc.statements),
  admin: ac.newRole({ user: ["list", "ban", "delete"] }),
  user: ac.newRole({ user: [] }),
};

export { ac };
