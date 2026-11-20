// Ruta privada "/perfil": cualquier usuario logueado (ProtectedRoute garantiza que hay sesión).
// Datos en modo lectura: el lápiz de "Usuario" y el de "Nombre" abren un modal para editarlos. Email y rol
// son solo lectura. Abajo, las cuentas vinculadas. También muestra el aviso "sin permisos" (si lo mandaron
// desde /admin) y los errores de vinculación (Better Auth vuelve acá con ?error=<código>).
import { useState } from "react";
import { useLocation } from "react-router";
import { LinkedAccounts } from "../components/LinkedAccounts";
import { PencilButton } from "../components/PencilButton";
import { ProfileEditModal } from "../components/ProfileEditModal";
import { useSession } from "../lib/auth-client";
import { getFirstAndLastName } from "../lib/names";
import { roleLabel } from "../lib/roles";

// Códigos que Better Auth manda en /perfil?error=<código> cuando falla la vinculación de una cuenta.
const LINK_ERRORS: Record<string, string> = {
  account_already_linked_to_different_user: "Esa cuenta ya está vinculada a otro usuario.",
};

export const Profile = () => {
  const { data: session } = useSession();
  const location = useLocation();
  const forbidden = (location.state as { forbidden?: boolean } | null)?.forbidden;
  const linkError = new URLSearchParams(location.search).get("error");
  // Qué modal de edición está abierto (null = ninguno).
  const [editing, setEditing] = useState<"username" | "name" | null>(null);

  if (!session) return null;
  const { user } = session;
  const { firstName, lastName } = getFirstAndLastName(user);

  return (
    <section className="flex flex-col gap-4">
      {forbidden && (
        <p role="alert" className="rounded bg-amber-50 p-3 text-sm text-amber-800">
          No tenés permisos para entrar a esa sección.
        </p>
      )}
      {linkError && (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">
          {LINK_ERRORS[linkError] ?? "No se pudo vincular la cuenta. Probá de nuevo."}
        </p>
      )}

      <div className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold">Mi perfil</h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
            <dt className="text-slate-600">Usuario</dt>
            <dd className="flex items-center gap-1">
              {user.username ? `@${user.username}` : "—"}
              <PencilButton
                label="Editar nombre de usuario"
                onClick={() => setEditing("username")}
              />
            </dd>
            <dt className="text-slate-600">Nombre</dt>
            <dd className="flex items-center gap-1">
              {`${firstName} ${lastName}`.trim() || user.name}
              <PencilButton label="Editar nombre" onClick={() => setEditing("name")} />
            </dd>
            <dt className="text-slate-600">Email</dt>
            <dd>{user.email}</dd>
            <dt className="text-slate-600">Rol</dt>
            <dd>
              <span className="inline-block rounded bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                {roleLabel(user.role)}
              </span>
            </dd>
          </dl>
        </div>

        <LinkedAccounts />
      </div>

      {editing && (
        <ProfileEditModal
          field={editing}
          initial={{ username: user.username ?? "", firstName, lastName }}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
};
