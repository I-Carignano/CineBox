// Bloque "o" + botones de Google y GitHub, compartido por login y registro. Google solo aparece si el
// backend lo habilitó (GET /api/config -> googleEnabled). Redirige al proveedor; al volver, Better Auth crea
// la sesión (o la cuenta, si es nueva) y manda al callbackURL. Si falla, vuelve a /login?error=<código>.
import { signIn } from "../lib/auth-client";
import { useGetAuthProvidersQuery } from "../store/moviesApi";
import { SocialButton, type SocialProvider } from "./SocialButton";

export const SocialLogin = ({ callbackURL }: { callbackURL: string }) => {
  const { data: providers } = useGetAuthProvidersQuery();

  const handleSocial = (provider: SocialProvider) =>
    signIn.social({ provider, callbackURL, errorCallbackURL: "/login" });

  return (
    <>
      <div className="my-4 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-col gap-2">
        {providers?.googleEnabled && (
          <SocialButton
            provider="google"
            label="Iniciar sesión con Google"
            onClick={() => handleSocial("google")}
          />
        )}
        <SocialButton
          provider="github"
          label="Iniciar sesión con GitHub"
          onClick={() => handleSocial("github")}
        />
      </div>
    </>
  );
};
