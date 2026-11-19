// Better Auth: guarda usuarios, sesiones y cuentas (GitHub/Google) en nuestro Mongo (colecciones user, session, account).
// Roles con el plugin admin(): todo usuario nuevo es "user"; "admin" se asigna a mano o desde /admin/usuarios.
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}. Revisá tu archivo .env (ver .env.example).`);
  return value;
}

// Better Auth usa el driver nativo de Mongo. Pasarlo como `client` habilita transacciones (Atlas = replica set).
const client = new MongoClient(requireEnv("MONGODB_URI"));

// Google es opcional: si faltan las variables, no se registra el provider y el login con Google queda desactivado.
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  // URL pública que ve el navegador: la del FRONT, porque /api llega al back a través del proxy / rewrite.
  // El secret se lee solo de BETTER_AUTH_SECRET.
  baseURL: requireEnv("BETTER_AUTH_URL"),
  database: mongodbAdapter(client.db(), { client }),
  emailAndPassword: {
    enabled: true, // hashea con scrypt; mínimo 8 caracteres por defecto
  },
  socialProviders: {
    github: {
      clientId: requireEnv("GITHUB_CLIENT_ID"),
      clientSecret: requireEnv("GITHUB_CLIENT_SECRET"),
    },
    ...(googleClientId && googleClientSecret
      ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
      : {}),
  },
  // Si alguien ya registrado con email+password entra con GitHub/Google (mismo email), une las cuentas
  // en vez de tirar account_not_linked.
  account: {
    accountLinking: { trustedProviders: ["github", "google"] },
  },
  plugins: [admin({ defaultRole: "user", adminRoles: ["admin"] })],
});
