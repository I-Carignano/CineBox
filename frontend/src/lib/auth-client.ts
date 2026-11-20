// Cliente de Better Auth. Sin baseURL: el front y la API comparten origen
// (proxy de Vite en local, rewrite de Render en producción).
import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import { ac, roles } from "./permissions";

export const authClient = createAuthClient({
  plugins: [
    adminClient({ ac, roles }),
    usernameClient(),
    // Campos extra que definió el backend. required:false porque los usuarios de GitHub/Google no los tienen.
    inferAdditionalFields({
      user: {
        firstName: { type: "string", required: false },
        lastName: { type: "string", required: false },
      },
    }),
  ],
});

// useSession es estado del SERVIDOR (como RTK Query): pide /api/auth/get-session y lo cachea.
// Es la ÚNICA fuente del estado de sesión: no se guarda nada en localStorage ni en Redux.
export const { useSession, signIn, signUp, signOut } = authClient;
