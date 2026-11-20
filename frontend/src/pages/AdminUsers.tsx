// Page: ruta "/admin/usuarios" (admin y superadmin). Quién puede hacer qué:
//   superadmin: ve a todos y, sobre cualquiera menos sí mismo, cambia el rol, da de baja / reactiva y elimina.
//   admin:      NO ve a los superadmin; sobre usuarios con rol "user" da de baja / reactiva, elimina y puede
//               ascenderlos a "admin" (select con Usuario / Administrador). A los admin los ve pero sin acciones.
// Cada acción pide confirmación en un modal. Los datos salen de Better Auth (authClient.admin), no de nuestra
// API, por eso no pasan por RTK Query. Los permisos los aplica el backend (control de acceso del plugin admin
// + el hook lib/user-management-guard.ts): acá solo se ocultan los botones y opciones que darían 403.
import { useEffect, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { authClient, useSession } from "../lib/auth-client";
import { authErrorMessage } from "../lib/auth-errors";
import { ROLE_LABELS, roleLabel } from "../lib/roles";
import type { UserRole } from "../types/auth";

type AdminUser = {
  id: string;
  name: string;
  username?: string | null;
  email: string;
  role?: string | null;
  banned?: boolean | null;
};

// Lo que se está por confirmar en el modal.
type Pending =
  | { kind: "role"; user: AdminUser; role: UserRole }
  | { kind: "ban"; user: AdminUser }
  | { kind: "remove"; user: AdminUser };

type ActionResult = { error: { message?: string; code?: string } | null };

const LIMIT = 100;
const ROLES = Object.keys(ROLE_LABELS) as UserRole[];

// Un rol desconocido o vacío cuenta como "user" (igual que en el backend).
const roleOf = (user: AdminUser): UserRole =>
  ROLES.includes(user.role as UserRole) ? (user.role as UserRole) : "user";

// "@usuario" si tiene; si no, el nombre.
const who = (user: AdminUser): string => (user.username ? `@${user.username}` : user.name);

export const AdminUsers = () => {
  const { data: session } = useSession();
  const viewerRole = session?.user.role;
  const isSuperadmin = viewerRole === "superadmin";
  // null = todavía cargando
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!viewerRole) return;
    authClient.admin
      .listUsers({
        query: {
          limit: LIMIT,
          sortBy: "createdAt",
          sortDirection: "desc",
          // El admin no ve a los superadmin: se filtran ya en la consulta (así también el total es correcto).
          ...(viewerRole === "superadmin"
            ? {}
            : { filterField: "role", filterOperator: "ne" as const, filterValue: "superadmin" }),
        },
      })
      .then(({ data, error }) => {
        if (error || !data) {
          setLoadError(error?.message ?? "No se pudo cargar la lista de usuarios");
          return;
        }
        // Red de seguridad por si el filtro del servidor no se aplicara.
        setUsers(
          viewerRole === "superadmin"
            ? data.users
            : data.users.filter((u) => u.role !== "superadmin"),
        );
        setTotal(data.total);
      });
  }, [viewerRole]);

  // ¿Puedo actuar (dar de baja / reactivar / eliminar / cambiar rol) sobre este usuario? Nunca sobre mí mismo.
  // El superadmin sobre cualquiera; el admin solo sobre los que tienen rol "user".
  const canActOn = (user: AdminUser): boolean => {
    if (user.id === session?.user.id) return false;
    return isSuperadmin || (viewerRole === "admin" && roleOf(user) === "user");
  };

  // Roles que puedo asignar: el superadmin, cualquiera; el admin, solo ascender a "admin" (user -> admin).
  const assignableRoles: UserRole[] = isSuperadmin ? ROLES : ["user", "admin"];

  // Ejecuta una acción sobre un usuario: maneja el "ocupado", el error y, si salió bien, actualiza la lista.
  // El modal queda abierto (con los botones bloqueados) hasta que termina, y se cierra al final.
  const runAction = async (
    user: AdminUser,
    call: () => Promise<ActionResult>,
    onSuccess: () => void,
    successMessage: string,
  ) => {
    setNotice(null);
    setActionError(null);
    setBusyId(user.id);
    const { error } = await call();
    setBusyId(null);
    setPending(null);
    if (error) {
      setActionError(
        `No se pudo completar la acción sobre ${who(user)}: ${authErrorMessage(error, error.message ?? "error desconocido")}`,
      );
      return;
    }
    onSuccess();
    setNotice(successMessage);
  };

  const patchUser = (id: string, changes: Partial<AdminUser>) =>
    setUsers((current) => current?.map((u) => (u.id === id ? { ...u, ...changes } : u)) ?? null);

  const applyRole = (user: AdminUser, role: UserRole) =>
    runAction(
      user,
      () => authClient.admin.setRole({ userId: user.id, role }),
      () => patchUser(user.id, { role }),
      `${who(user)} ahora es ${roleLabel(role).toLowerCase()}.`,
    );

  const applyBan = (user: AdminUser) =>
    runAction(
      user,
      () => authClient.admin.banUser({ userId: user.id }),
      () => patchUser(user.id, { banned: true }),
      `${who(user)} fue dado de baja y no puede iniciar sesión.`,
    );

  // Reactivar no es destructivo: se hace directo, sin modal.
  const applyUnban = (user: AdminUser) =>
    runAction(
      user,
      () => authClient.admin.unbanUser({ userId: user.id }),
      () => patchUser(user.id, { banned: false }),
      `${who(user)} fue reactivado.`,
    );

  const applyRemove = (user: AdminUser) =>
    runAction(
      user,
      () => authClient.admin.removeUser({ userId: user.id }),
      () => {
        setUsers((current) => current?.filter((u) => u.id !== user.id) ?? null);
        setTotal((current) => current - 1);
      },
      `${who(user)} fue eliminado. Sus películas siguen en el catálogo.`,
    );

  // Resumen del usuario para los modales de baja y eliminación.
  const userSummary = (user: AdminUser) => [
    { label: "Usuario", value: user.username ? `@${user.username}` : "—" },
    { label: "Nombre", value: user.name },
    { label: "Email", value: user.email },
    { label: "Rol", value: roleLabel(user.role) },
  ];

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">Usuarios y roles</h2>

      {!isSuperadmin && session && (
        <p className="rounded bg-slate-100 p-3 text-sm text-slate-600">
          Sobre los usuarios con rol Usuario podés dar de baja, reactivar, eliminar y ascenderlos a
          Administrador. Una vez administradores, solo el superadmin puede gestionarlos.
        </p>
      )}

      {notice && (
        <p role="status" className="rounded bg-green-50 p-3 text-sm text-green-800">
          {notice}
        </p>
      )}
      {actionError && (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">
          {actionError}
        </p>
      )}
      {loadError && (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">
          {loadError}
        </p>
      )}
      {users === null && !loadError && (
        <p role="status" className="text-slate-600">
          Cargando usuarios...
        </p>
      )}

      {users && users.length === 0 && (
        <p className="text-slate-600">No hay usuarios registrados.</p>
      )}

      {users && users.length > 0 && (
        <>
          <p className="text-sm text-slate-600">
            {total > users.length
              ? `Mostrando los últimos ${users.length} de ${total} usuarios`
              : `${total} ${total === 1 ? "usuario" : "usuarios"}`}
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-3xl text-left text-sm">
              <caption className="sr-only">Usuarios registrados</caption>
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Usuario
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Nombre
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Email
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Rol
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Estado
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isSelf = user.id === session?.user.id;
                  const busy = busyId === user.id;
                  const role = roleOf(user);
                  const canAct = canActOn(user);
                  return (
                    <tr key={user.id}>
                      <td className="px-3 py-2">{user.username ? `@${user.username}` : "—"}</td>
                      <td className="px-3 py-2 font-medium">
                        {user.name}
                        {isSelf && (
                          <span className="ml-2 text-xs font-normal text-slate-600">(vos)</span>
                        )}
                      </td>
                      <td className="px-3 py-2">{user.email}</td>
                      <td className="px-3 py-2">
                        {canAct ? (
                          // El select sigue mostrando el rol actual hasta que se confirma el cambio en el modal.
                          <select
                            aria-label={`Rol de ${user.name}`}
                            value={role}
                            disabled={busy}
                            onChange={(event) =>
                              setPending({
                                kind: "role",
                                user,
                                role: event.target.value as UserRole,
                              })
                            }
                            className="rounded border border-slate-300 bg-white px-2 py-1 disabled:opacity-60"
                          >
                            {assignableRoles.map((value) => (
                              <option key={value} value={value}>
                                {ROLE_LABELS[value]}
                              </option>
                            ))}
                          </select>
                        ) : (
                          roleLabel(user.role)
                        )}
                      </td>
                      <td
                        className={`px-3 py-2 ${user.banned ? "text-red-700" : "text-green-700"}`}
                      >
                        {user.banned ? "De baja" : "Activo"}
                      </td>
                      <td className="px-3 py-2">
                        {canAct ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                user.banned ? applyUnban(user) : setPending({ kind: "ban", user })
                              }
                              disabled={busy}
                              className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-100 disabled:opacity-50"
                            >
                              {user.banned ? "Reactivar" : "Dar de baja"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setPending({ kind: "remove", user })}
                              disabled={busy}
                              aria-label={`Eliminar a ${user.name}`}
                              className="rounded border border-red-300 px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              Eliminar
                            </button>
                          </div>
                        ) : (
                          <span
                            className="text-xs text-slate-500"
                            title={
                              isSelf
                                ? "No podés gestionarte a vos mismo"
                                : "Sin permisos sobre este usuario"
                            }
                          >
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pending?.kind === "role" && (
        <ConfirmDialog
          title="Cambiar rol"
          message={`¿Cambiar el rol de ${who(pending.user)} de ${roleLabel(pending.user.role)} a ${roleLabel(pending.role)}?`}
          confirmLabel="Sí, cambiar"
          busyLabel="Cambiando..."
          busy={busyId === pending.user.id}
          onConfirm={() => applyRole(pending.user, pending.role)}
          onCancel={() => setPending(null)}
        />
      )}
      {pending?.kind === "ban" && (
        <ConfirmDialog
          title="Dar de baja usuario"
          message="¿Estás seguro de que querés dar de baja a este usuario? No va a poder iniciar sesión hasta que lo reactiven."
          summary={userSummary(pending.user)}
          confirmLabel="Sí, dar de baja"
          busyLabel="Procesando..."
          danger
          busy={busyId === pending.user.id}
          onConfirm={() => applyBan(pending.user)}
          onCancel={() => setPending(null)}
        />
      )}
      {pending?.kind === "remove" && (
        <ConfirmDialog
          title="Eliminar usuario"
          message="¿Estás seguro de que querés eliminar a este usuario? No se puede deshacer. Sus películas siguen en el catálogo."
          summary={userSummary(pending.user)}
          confirmLabel="Sí, eliminar"
          busyLabel="Eliminando..."
          danger
          busy={busyId === pending.user.id}
          onConfirm={() => applyRemove(pending.user)}
          onCancel={() => setPending(null)}
        />
      )}
    </section>
  );
};
