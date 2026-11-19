# Referencia: patrones del repo de la materia (T-Arias/mdw-2026, versión de la clase 13)

Lo que hay que **copiar en estilo** del repo del profe y lo que **cambia** para el TP. El repo completo se clona aparte como referencia de solo lectura:

```bash
cd ~/source/"Repos VS code"/"TP2 - Peliculas - MYDW"
git clone https://github.com/T-Arias/mdw-2026 mdw-2026-ref
```

Archivos clave para mirar: `backend/src/lib/auth.ts`, `backend/src/middlewares/*`, `backend/src/server.ts`, `backend/src/services/students.service.ts`, `backend/src/controllers/students.controller.ts`, `frontend/src/lib/*`, `frontend/src/router/*`, `frontend/src/pages/Login.tsx`, `frontend/src/pages/Sessions.tsx`, `frontend/src/store/api.ts`, `clase 13/README.md`.

## Convenciones de código del profe (respetarlas)

| Convención | Ejemplo |
|---|---|
| Identificadores en inglés; comentarios y mensajes al usuario en español | `listStudents`, `// Valida req.body contra...` |
| Capas: routes (mapeo, sin lógica) → controllers (HTTP) → services (negocio y datos) → models | `students.routes.ts` / `.controller.ts` / `.service.ts` |
| Comentario de una línea al principio de cada archivo explicando para qué está | `// Controller = capa HTTP: lee req, llama al service...` |
| Imports relativos con extensión `.js` (ESM nodenext) | `import { auth } from "../lib/auth.js"` |
| `requireEnv(name)` en vez de `process.env.X!` | ver `lib/auth.ts` |
| Filtros de Mongo armados campo por campo, nunca el input crudo; regex escapada | `escapeRegex(search)` |
| `isValidObjectId(id)` → 400 antes de consultar | controllers |
| Duplicados: `isDuplicateKeyError` (código 11000) → 409 | `lib/is-duplicate-key-error.ts` |
| Arrow functions con `export const` en el front | `export const Login = () => {...}` |
| Componentes presentacionales por props; las pages piden datos | `StudentCard` vs `Home` |
| Errores de RTK Query como string (`axiosBaseQuery`) | `store/api.ts` |

## Backend

### `server.ts`: el orden importa

```ts
import express from "express";
import "dotenv/config";                 // antes que lib/auth (lee env al importarse)
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

app.all("/api/auth/*splat", toNodeHandler(auth)); // ANTES de express.json()
app.use(express.json());
app.use("/api", apiRouter);   // en el TP: /api/peliculas (el profe usaba /api/v1)
```

Sin `cors` ni `cookie-parser`: el front llama a `/api` desde su mismo origen (proxy de Vite / rewrite de Render).

### `lib/auth.ts`

```ts
const client = new MongoClient(requireEnv("MONGODB_URI"));

export const auth = betterAuth({
  baseURL: requireEnv("BETTER_AUTH_URL"),          // URL del FRONT
  database: mongodbAdapter(client.db(), { client }),
  emailAndPassword: { enabled: true },             // scrypt, mínimo 8
  socialProviders: { github: { clientId: requireEnv("GITHUB_CLIENT_ID"), clientSecret: requireEnv("GITHUB_CLIENT_SECRET") } },
  account: { accountLinking: { trustedProviders: ["github"] } },
  plugins: [admin()],                              // user.role, "user" por defecto
});
```

### `middlewares/auth.middleware.ts`

```ts
export async function authMiddleware(req, res, next) {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) return res.status(401).json({ success: false, error: { message: "Sesion requerida" } });
    req.user = session.user;
    next();
  } catch (error) {
    console.error("[auth] error reading session:", error);
    res.status(500).json({ success: false, error: { message: "No se pudo verificar la sesion" } });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req, res, next) => {
    if (!req.user) return res.status(401)...;
    if (!roles.includes(req.user.role as UserRole)) return res.status(403)...;
    next();
  };
}
```

### `types/auth.types.ts`

```ts
type Session = typeof auth.$Infer.Session;
export type SessionUser = Session["user"];
export type UserRole = "admin" | "user";
declare global { namespace Express { interface Request { user?: SessionUser } } }
```

### Service con paginación

```ts
const [data, total] = await Promise.all([
  Model.find(filter).sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 }).skip((page - 1) * limit).limit(limit),
  Model.countDocuments(filter),
]);
return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
```

### Lo que CAMBIA respecto del repo del profe

| Repo del profe | TP |
|---|---|
| `QUERY /api/v1/students` con filtros en el body | `GET /api/peliculas` con query params + `validateQuery` en `res.locals` |
| Prefijo `/api/v1` | `/api/peliculas` (literal de la consigna) |
| Dos formatos de error mezclados | Uno solo: `{ success: false, error: { message, details? } }` |
| `PUT` parcial | `PUT` completo + `PATCH` parcial |
| `findByIdAndUpdate` directo | Buscar → 404 → chequeo de dueño → 403 → actualizar |
| Agente / LangChain / `/chat` | No va |

## Frontend

### `lib/auth-client.ts`

```ts
export const authClient = createAuthClient({ plugins: [adminClient()] }); // sin baseURL
export const { useSession, signIn, signUp, signOut } = authClient;
```

### Uso

```ts
const { data: session, isPending } = useSession();
const { error } = await signIn.email({ email, password });      // NO tira: devuelve { data, error }
const { error } = await signUp.email({ name, email, password }); // deja la sesión abierta
await signIn.social({ provider: "github", callbackURL: from, errorCallbackURL: "/login" });
await signOut(); window.location.replace("/login");
authClient.admin.listUsers({ query: { limit: 50 } });
authClient.admin.setRole({ userId, role: "admin" });
```

### Detalles del `Login` del profe

- `if (session && !isSubmitting) return <Navigate to={from} replace />`.
- `?error=account_not_linked` → pedir la contraseña y después `authClient.linkSocial({ provider: "github", callbackURL: from })`.

### `ProtectedRoute`

```tsx
const { data: session, isPending } = useSession();
if (isPending) return <p>Verificando sesion...</p>;
if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
if (roles && !roles.includes(session.user.role as UserRole)) return <Navigate to={redirectTo} replace />;
return <Outlet />;
```

### `store/api.ts`: `axiosBaseQuery`

```ts
const axiosBaseQuery: BaseQueryFn<AxiosRequestConfig, unknown, string> = async (config) => {
  try { const { data } = await http.request(config); return { data }; }
  catch (err) { return { error: getErrorMessage(err) }; }
};
```

## Render (de `clase 13/README.md`)

| Backend: Web Service | Frontend: Static Site |
|---|---|
| Root `backend` | Root `frontend` |
| Build `npm install --include=dev && npm run build` | Build `npm install && npm run build` |
| Start `npm start` | Publish `dist` |
| Env: `NODE_ENV=production`, `NODE_VERSION=22`, `MONGODB_URI`, `BETTER_AUTH_SECRET` (nuevo), `BETTER_AUTH_URL=https://<front>.onrender.com`, `GITHUB_*` de prod | Env `NODE_VERSION=22`. Rewrites en orden: `/api/*` → `https://<back>.onrender.com/api/*`, `/*` → `/index.html` |

`PORT` no se configura: Render la inyecta. Plan free: el back se duerme a los 15 minutos y el primer request tarda unos 50 segundos.

## Errores típicos (tabla del profe)

| Síntoma | Causa |
|---|---|
| `Relative import paths need explicit file extensions` | Falta `.js` en un import |
| `ERR_REQUIRE_ESM` | Falta `"type": "module"` |
| Render: `tsc: not found` | Build sin `--include=dev` |
| `Missing BETTER_AUTH_URL` | Falta la variable |
| GitHub: `redirect_uri is not associated` | La callback no coincide exacto |
| GitHub vuelve a localhost en prod | `BETTER_AUTH_URL` del back apunta a localhost |
| GitHub: `email_not_found` | Email privado en GitHub |
| `Invalid origin` (403) | Se entró por la URL del back o por otro puerto |
| F5 da 404 en Render | Falta el rewrite `/*` |
| Login OK pero `useSession` vacío | El front llama directo al back y no a `/api` |
| `/admin` redirige a `/perfil` | El usuario no tiene `role: "admin"` |
