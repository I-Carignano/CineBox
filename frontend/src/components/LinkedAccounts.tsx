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
import { ProviderIcon, SocialButton, type SocialProvider } from "./SocialButton";

const PROVIDER_LABELS: Record<string, string> = {
  credential: "Email y contraseña",
  github: "GitHub",
  google: "Google",
};

const isSocial = (id: string): id is SocialProvider => id === "github" || id === "google";

// Sobre para "Email y contraseña" (no es un proveedor social, así que no tiene logo de marca).
const EmailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5 shrink-0 text-muted"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

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
      <h3 className="text-sm font-semibold text-text">Cuentas vinculadas</h3>
      {linked === null ? (
        <p className="text-sm text-muted">Cargando...</p>
      ) : (
        <>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-text">
            {linked.map((id) => (
              <li key={id} className="flex items-center gap-2">
                {isSocial(id) ? <ProviderIcon provider={id} /> : <EmailIcon />}
                {PROVIDER_LABELS[id] ?? id}
              </li>
            ))}
            {!linked.includes("credential") && (
              <li className="flex items-center gap-2">
                <EmailIcon />
                <span>
                  {PROVIDER_LABELS.credential} —{" "}
                  <button
                    type="button"
                    onClick={() => setAddingPassword(true)}
                    className="font-medium text-gold underline"
                  >
                    Agregar
                  </button>
                </span>
              </li>
            )}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            {linkable
              .filter((provider) => !linked.includes(provider))
              .map((provider) => (
                <SocialButton
                  key={provider}
                  compact
                  provider={provider}
                  label={`Vincular ${PROVIDER_LABELS[provider]}`}
                  onClick={() => handleLink(provider)}
                />
              ))}
          </div>
        </>
      )}
      {linkError && (
        <p role="alert" className="mt-2 text-sm text-danger">
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
