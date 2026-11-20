// Ruta privada "/perfil": cualquier usuario logueado (ProtectedRoute garantiza que hay sesión).
// Muestra nombre, email, rol y cuentas vinculadas, y el aviso de "sin permisos" si lo mandaron desde /admin.
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { authClient, useSession } from "../lib/auth-client";
import { authErrorMessage } from "../lib/auth-errors";

const PROVIDER_LABELS: Record<string, string> = {
  credential: "Email y contraseña",
  github: "GitHub",
  google: "Google",
};

export const Profile = () => {
  const { data: session } = useSession();
  const location = useLocation();
  const forbidden = (location.state as { forbidden?: boolean } | null)?.forbidden;
  // null = todavía cargando
  const [providers, setProviders] = useState<string[] | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    authClient
      .listAccounts()
      .then(({ data }) => setProviders((data ?? []).map((a) => a.providerId)));
  }, []);

  if (!session) return null;
  const { user } = session;

  // Link EXPLÍCITO: el usuario ya está logueado (probó que es dueño de la cuenta local).
  // Redirige a GitHub y vuelve acá con las cuentas unidas.
  const handleLinkGithub = async () => {
    const { error } = await authClient.linkSocial({ provider: "github", callbackURL: "/perfil" });
    if (error) setLinkError(authErrorMessage(error, "No se pudo conectar GitHub"));
  };

  return (
    <section className="flex flex-col gap-4">
      {forbidden && (
        <p role="alert" className="rounded bg-amber-50 p-3 text-sm text-amber-800">
          No tenés permisos para entrar a esa sección.
        </p>
      )}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">{user.name}</h2>
        <p className="text-slate-600">{user.email}</p>
        <span className="mt-2 inline-block rounded bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
          {user.role === "admin" ? "Administrador" : "Usuario"}
        </span>

        <h3 className="mt-6 text-sm font-semibold text-slate-700">Cuentas vinculadas</h3>
        {providers === null ? (
          <p className="text-sm text-slate-500">Cargando...</p>
        ) : (
          <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
            {providers.map((id) => (
              <li key={id}>{PROVIDER_LABELS[id] ?? id}</li>
            ))}
          </ul>
        )}

        {providers !== null && !providers.includes("github") && (
          <button
            type="button"
            onClick={handleLinkGithub}
            className="mt-4 rounded border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100"
          >
            Conectar GitHub
          </button>
        )}
        {linkError && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {linkError}
          </p>
        )}
      </div>
    </section>
  );
};
