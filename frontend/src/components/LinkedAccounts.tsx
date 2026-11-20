// Sección "Cuentas vinculadas" del perfil: lista las cuentas (email y contraseña, GitHub, Google) y ofrece
// agregar las que faltan:
//   - GitHub / Google: authClient.linkSocial (vuelve a /perfil después de autorizar en el proveedor).
//     Google solo aparece si el backend lo tiene habilitado (GET /api/config -> googleEnabled).
//   - Email y contraseña ("credential"): modal que llama a POST /api/perfil/contrasena. Sirve para quien se
//     registró con GitHub o Google y quiere poder entrar también con email y contraseña.
import { useEffect, useState } from "react";
import { authClient, useSession } from "../lib/auth-client";
import { authErrorMessage } from "../lib/auth-errors";
import { useGetAuthProvidersQuery } from "../store/moviesApi";
import { AddPasswordModal } from "./AddPasswordModal";

const PROVIDER_LABELS: Record<string, string> = {
  credential: "Email y contraseña",
  github: "GitHub",
  google: "Google",
};

type SocialProvider = "github" | "google";

export const LinkedAccounts = () => {
  const { data: session } = useSession();
  const { data: config } = useGetAuthProvidersQuery();
  // null = todavía cargando
  const [linked, setLinked] = useState<string[] | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [addingPassword, setAddingPassword] = useState(false);

  useEffect(() => {
    authClient.listAccounts().then(({ data }) => setLinked((data ?? []).map((a) => a.providerId)));
  }, []);

  // Link EXPLÍCITO: el usuario ya está logueado (probó que es dueño de la cuenta local). Redirige al proveedor
  // y vuelve a /perfil con las cuentas unidas (también si la cuenta tiene otro email o falla: errorCallbackURL).
  const handleLink = async (provider: SocialProvider) => {
    setLinkError(null);
    const { error } = await authClient.linkSocial({
      provider,
      callbackURL: "/perfil",
      errorCallbackURL: "/perfil",
    });
    if (error) setLinkError(authErrorMessage(error, "No se pudo vincular la cuenta"));
  };

  const linkable: SocialProvider[] = config?.googleEnabled ? ["github", "google"] : ["github"];

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700">Cuentas vinculadas</h3>
      {linked === null ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : (
        <>
          <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
            {linked.map((id) => (
              <li key={id}>{PROVIDER_LABELS[id] ?? id}</li>
            ))}
            {!linked.includes("credential") && (
              <li>
                {PROVIDER_LABELS.credential} —{" "}
                <button
                  type="button"
                  onClick={() => setAddingPassword(true)}
                  className="font-medium text-brand-600 underline"
                >
                  Agregar
                </button>
              </li>
            )}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            {linkable
              .filter((provider) => !linked.includes(provider))
              .map((provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => handleLink(provider)}
                  className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100"
                >
                  Vincular {PROVIDER_LABELS[provider]}
                </button>
              ))}
          </div>
        </>
      )}
      {linkError && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {linkError}
        </p>
      )}

      {addingPassword && session && (
        <AddPasswordModal
          email={session.user.email}
          onClose={() => setAddingPassword(false)}
          onDone={() => {
            // Ya existe la cuenta de email y contraseña: aparece en la lista sin pedirla de nuevo.
            setLinked((current) => [...(current ?? []), "credential"]);
            setAddingPassword(false);
          }}
        />
      )}
    </div>
  );
};
