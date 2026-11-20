// Better Auth: guarda usuarios, sesiones y cuentas (GitHub/Google) en nuestro Mongo (colecciones user, session, account).
// Roles con el plugin admin(): todo usuario nuevo es "user"; "admin" y "superadmin" los asigna el seed o un superadmin desde /admin/usuarios.
// Nombre de usuario único con el plugin username() (el login sigue siendo por email); nombre y apellido son campos extra.
import { betterAuth } from "better-auth";
import { admin, username } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import { ac, roles } from "./permissions.js";
import { userManagementGuard } from "./user-management-guard.js";

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
// El front consulta esto (GET /api/config) para saber si muestra el botón de Google.
export const googleEnabled = Boolean(googleClientId && googleClientSecret);

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
      // GitHub solo da un "name" completo: primera palabra = nombre, el resto = apellido. No se inventa username.
      mapProfileToUser: (profile) => {
        const [firstName, ...rest] = (profile.name ?? "").trim().split(/\s+/).filter(Boolean);
        return { firstName, lastName: rest.join(" ") || undefined };
      },
    },
    ...(googleEnabled
      ? {
          google: {
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
            // Google ya separa nombre y apellido.
            mapProfileToUser: (profile) => ({
              firstName: profile.given_name,
              lastName: profile.family_name,
            }),
          },
        }
      : {}),
  },
  user: {
    // Campos extra del registro por email. Los usuarios de GitHub/Google no los tienen (se muestra su name).
    additionalFields: {
      // required:false para no romper el alta por GitHub/Google; el registro por email los exige en el Zod del front.
      firstName: { type: "string", required: false, input: true },
      lastName: { type: "string", required: false, input: true },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      // Si alguien ya registrado con email+password entra con GitHub/Google (mismo email), une las cuentas
      // en vez de tirar account_not_linked.
      trustedProviders: ["github", "google"],
      // Vincular a mano desde /perfil (linkSocial, con sesión iniciada) una cuenta que tiene OTRO email.
      allowDifferentEmails: true,
    },
  },
  // Reglas sobre el usuario objetivo en la gestión de usuarios (el admin solo toca "user", nadie cambia su rol).
  hooks: { before: userManagementGuard },
  plugins: [
    // Los permisos de cada rol sobre los usuarios viven en lib/permissions.ts.
    admin({ ac, roles, defaultRole: "user", adminRoles: ["admin", "superadmin"] }),
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      // Letras, números, guion bajo y punto. Se normaliza a minúsculas: es único sin distinguir mayúsculas.
      usernameValidator: (value) => /^[a-zA-Z0-9_.]+$/.test(value),
      displayUsername: false, // un solo campo de usuario alcanza
    }),
  ],
});
