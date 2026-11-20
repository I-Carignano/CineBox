// Cliente de Better Auth. Sin baseURL: el front y la API comparten origen
// (proxy de Vite en local, rewrite de Render en producción).
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient()],
});

// useSession es estado del SERVIDOR (como RTK Query): pide /api/auth/get-session y lo cachea.
// Es la ÚNICA fuente del estado de sesión: no se guarda nada en localStorage ni en Redux.
export const { useSession, signIn, signUp, signOut } = authClient;
