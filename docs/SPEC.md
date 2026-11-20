# SPEC — App de Películas (TP2)

Especificación técnica del sistema. Si algo de acá contradice a `CONSIGNA.md`, **gana la consigna**: avisar y corregir este archivo.

## 1. Qué es la app

Catálogo de películas full stack.

- **Cualquiera (sin sesión):** ve el listado con búsqueda, filtros y paginación, y el detalle de cada película.
- **`user` (rol por defecto al registrarse):** lo mismo, más su perfil. Solo lectura.
- **`admin`:** además entra a `/admin` y hace el ABM de películas. Cada admin edita y borra **solo las películas que creó** (opcional "registros propios"). En `/admin/usuarios` cambia roles.

## 2. Stack y versiones

Las mismas del repo de la materia a noviembre de 2026. No cambiar versiones mayores sin avisar.

| Capa | Tecnología |
|---|---|
| Runtime | Node 22 (local y Render) |
| Backend | Express 5 + TypeScript (ESM, `module: nodenext`), Mongoose 9, Zod 4, dotenv |
| Auth | better-auth 1.7 + @better-auth/mongo-adapter 1.7 + mongodb 7.5, plugin `admin()` |
| Frontend | React 19 + Vite 8 + TypeScript, React Router 7, React Hook Form 7 + @hookform/resolvers + Zod 4, Redux Toolkit 2 (RTK Query), axios, Tailwind CSS 4 |
| Base | MongoDB Atlas (una base para dev y otra para prod en el mismo cluster) |
| Deploy | Render: backend como Web Service, frontend como Static Site |

**No se usan:** `cors`, `cookie-parser`, `jsonwebtoken`, `bcrypt` (auth hecha a mano), ni nada de LangChain/agente de las clases 14–15.

## 3. Entidad `Movie`, expuesta como recurso `/api/peliculas`

El código va en inglés, como en el repo del profe (`Movie`, `movies.service.ts`). La URL pública está en español y en plural: `/api/peliculas`.

| Campo | Tipo Mongoose | Zod (crear) | Reglas |
|---|---|---|---|
| `title` | String | `z.string().trim().min(1).max(150)` | requerido |
| `director` | String | `z.string().trim().min(1).max(100)` | requerido |
| `genre` | String (enum) | `z.enum(GENRES)` | requerido |
| `durationMinutes` | Number | `z.number().int().min(1).max(600)` | requerido |
| `releaseDate` | Date | `z.iso.date()` (YYYY-MM-DD) | requerido; no puede ser futura a más de 5 años |
| `rating` | Number | `z.number().min(0).max(10).refine(v => Number.isInteger(Math.round(v * 10 * 1e6) / 1e6), { error: "El rating admite un solo decimal" })` | requerido, 1 decimal (no usar `multipleOf` por los flotantes) |
| `available` | Boolean | `z.boolean().optional()` | default `true` **en el modelo de Mongoose**, no en Zod |
| `synopsis` | String | `z.string().trim().max(1000).optional()` | opcional |
| `posterUrl` | String | `z.url().optional()` | opcional |
| `createdBy` | String (id de usuario de Better Auth) | **no viene en el body** | lo pone el server con `req.user.id` |
| `createdAt` / `updatedAt` | Date | — | `timestamps: true` |

`GENRES = ["accion", "aventura", "animacion", "ciencia_ficcion", "comedia", "documental", "drama", "fantasia", "romance", "suspenso", "terror"] as const`

Tipos usados: texto, número, fecha, booleano y enum. La consigna pide mínimo 3.

`updateMovieSchema = createMovieSchema.partial().refine(obj => Object.keys(obj).length > 0, { error: "Hay que mandar al menos un campo" })`.

**Sin defaults en Zod:** en Zod 4 un `.default()` se aplica también dentro de `.partial()`, y un PATCH `{ title }` pisaría `available` con `true`. Por eso `createMovieSchema` no lleva ningún `.default()`; el default de `available` vive en el modelo de Mongoose (`default: true`).
Zod es **estricto**: un campo desconocido como `createdBy` en el body se rechaza con 400 (`z.strictObject`).

## 4. API

Base: `/api`. Las rutas de la entidad cuelgan de `/api/peliculas` (como pide la consigna, **sin `/v1`**). Better Auth ocupa `/api/auth/*`.

### 4.1 Endpoints

| Método | Ruta | Rol requerido | Éxito | Errores |
|---|---|---|---|---|
| GET | `/api/peliculas` | Público (con `mine=true` exige sesión) | 200 `{ data, meta }` | 400 query inválida, 401 si `mine=true` sin sesión |
| QUERY | `/api/peliculas` | Público (con `mine: true` exige sesión) | 200 `{ data, meta }` | Igual que el GET, pero con los filtros en el **body** JSON (lineamiento del repo del profe) |
| GET | `/api/peliculas/:id` | Público | 200 película | 400 id mal formado, 404 no existe |
| POST | `/api/peliculas` | admin | 201 película creada | 400 Zod, 401, 403 |
| PATCH | `/api/peliculas/:id` | admin, dueño | 200 película actualizada | 400, 401, 403 (no admin o no dueño), 404 |
| PUT | `/api/peliculas/:id` | admin, dueño | 200 | igual que PATCH, pero exige el objeto completo (`createMovieSchema`) |
| DELETE | `/api/peliculas/:id` | admin, dueño | 204 sin body | 400, 401, 403, 404 |
| GET | `/api/auth/ok` | — | 200 `{ ok: true }` (healthcheck de Better Auth) | — |
| GET | `/health` | — | 200 `{ status, uptimeSeconds, timestamp }` | — |
| * | `/api/auth/*` | Better Auth | sign-up/email, sign-in/email, sign-in/social, sign-out, get-session, callback/github, callback/google, admin/* | — |

PUT y PATCH: la consigna dice "PUT / PATCH". Implementamos **los dos** con la semántica correcta (PUT reemplazo completo, PATCH parcial). El front usa PATCH.

GET y QUERY: el **GET con query params es el obligatorio** (consigna) y es el que usa el front. `QUERY` es un extra que sigue al repo del profe: mismo service, mismo schema de filtros (en el body, con tipos nativos en vez de strings), y `QUERY` agregado a los métodos aceptados. Las dos rutas llaman al mismo `moviesService.list(filters)`.

### 4.2 Query params del listado (`GET /api/peliculas`)

| Param | Tipo | Default | Validación |
|---|---|---|---|
| `page` | int | 1 | `z.coerce.number().int().min(1)` |
| `limit` | int | 12 | `min(1).max(50)` |
| `search` | string | — | trim, 1–100; busca en `title` y `director` (regex escapada, case-insensitive) |
| `genre` | enum | — | uno de `GENRES` |
| `available` | `"true"` / `"false"` | — | se transforma a boolean |
| `minRating` | number | — | 0–10 |
| `sortBy` | enum | `createdAt` | `createdAt`, `title`, `releaseDate`, `rating`, `durationMinutes` |
| `sortOrder` | `asc` / `desc` | `desc` | — |
| `mine` | `"true"` | — | requiere sesión; filtra `createdBy = req.user.id` |

**Express 5:** `req.query` es un getter de solo lectura. **No se puede reasignar.** `validateQuery` guarda el resultado en `res.locals.query`, y el controller lo lee de ahí.

Respuesta:

```json
{
  "data": [ { "_id": "...", "title": "...", "...": "..." } ],
  "meta": { "total": 37, "page": 1, "limit": 12, "totalPages": 4 }
}
```

### 4.3 Formato de errores

Uno solo en toda la API (el repo del profe mezcla dos):

```json
{ "success": false, "error": { "message": "Texto claro en español", "details": { "title": ["El título es obligatorio"] } } }
```

`details` solo aparece en los 400 de Zod (`z.flattenError(err).fieldErrors`). Los errores de Zod que no son de un campo (un campo desconocido como `createdBy`, o "Hay que mandar al menos un campo") van bajo la clave `_general`. Mensajes en español y claros (locale `es` de Zod + mensajes propios).

Un body que no es JSON válido responde 400 "El JSON enviado no es válido".

| Caso | Status | message |
|---|---|---|
| Zod falla | 400 | "Los datos enviados no son válidos" + `details` |
| id no es ObjectId | 400 | "El id no es válido" |
| No existe | 404 | "Película no encontrada" |
| Sin sesión | 401 | "Sesión requerida" |
| No es admin | 403 | "No tenés permisos para realizar esta acción" |
| No es dueño | 403 | "Solo podés modificar las películas que creaste" |
| Error inesperado | 500 | "Error interno del servidor" (el detalle va a `console.error`, nunca al cliente) |

### 4.4 Middlewares de escritura (orden)

```ts
const onlyAdmin = [authMiddleware, requireRole("admin")];
router.post("/", onlyAdmin, validateBody(createMovieSchema), createMovie);
router.put("/:id", onlyAdmin, validateBody(createMovieSchema), replaceMovie);
router.patch("/:id", onlyAdmin, validateBody(updateMovieSchema), updateMovie);
router.delete("/:id", onlyAdmin, deleteMovie);
```

El chequeo de dueño va en el **service/controller**: buscar por id → 404 si no existe → 403 si `createdBy !== req.user.id` → recién ahí modificar.

**Regla del dueño: pendiente de la respuesta del profe (P03).** Desde F3, `createdBy` se guarda siempre (sirve para cualquier interpretación). Lo que se define en F4:

| Opción | `user` | `admin` |
|---|---|---|
| Planteada al profe (probable) | Crea registros a su nombre y edita/borra solo los suyos | Crea, edita y borra todos + gestiona usuarios y roles |
| Default si no responde | Solo lee | Crea; edita/borra solo lo suyo (`ENFORCE_OWNERSHIP = true` en `src/config/ownership.ts`) |

Si gana la opción planteada, las rutas de escritura pasan a `authMiddleware` + chequeo de dueño, con bypass para `admin`. **No implementar F4 sin confirmación de Nacho sobre esta tabla.**

## 5. Better Auth (backend)

`src/lib/auth.ts`, basado en el del profe:

- `baseURL: requireEnv("BETTER_AUTH_URL")`: es la URL **del front**.
- `database: mongodbAdapter(client.db(), { client })`.
- `emailAndPassword: { enabled: true }` (mínimo 8 caracteres por defecto).
- `socialProviders.github` (obligatorio) y `socialProviders.google` (opcional, solo si están las variables `GOOGLE_*`; si faltan, no se registra el provider y el botón de Google se oculta).
- `account.accountLinking.trustedProviders: ["github", "google"]`.
- `plugins: [admin({ defaultRole: "user", adminRoles: ["admin"] })]`.
- En `server.ts`: `app.all("/api/auth/*splat", toNodeHandler(auth))` **antes** de `express.json()`.

## 6. Frontend

### 6.1 Rutas

| Ruta | Página | Acceso | Layout |
|---|---|---|---|
| `/` | redirect a `/peliculas` | — | — |
| `/peliculas` | `MoviesList`: grilla, búsqueda, filtros, paginación | Pública | Sí |
| `/peliculas/:id` | `MovieDetail` | Pública | Sí |
| `/login` | `Login`: email + GitHub (+ Google) | Pública (si hay sesión, redirige) | No |
| `/register` | `Register` | Pública | No |
| `/perfil` | `Profile`: nombre, email, rol, cuentas vinculadas | Logueado | Sí |
| `/admin` | `AdminMovies`: ABM, filtro "Mis películas" | admin | Sí |
| `/admin/usuarios` | `AdminUsers`: listado + `authClient.admin.setRole` | admin | Sí |
| `*` | `NotFound` | — | Sí |

Usuario común en `/admin` → `Navigate` a `/perfil` y aviso "No tenés permisos" (con `state`).

### 6.2 Reglas

- `lib/api.ts`: `axios.create({ baseURL: "/api" })`. **Nunca** la URL del backend.
- `lib/auth-client.ts`: `createAuthClient({ plugins: [adminClient()] })`, sin `baseURL`.
- Sesión: **solo** `useSession()`. Nada en `localStorage`.
- Datos de películas: RTK Query (`store/moviesApi.ts`) con `providesTags` / `invalidatesTags`. El listado recibe los filtros como argumento de la query, así cada combinación queda en su propia entrada de caché.
- Formularios: React Hook Form + `zodResolver`, `noValidate`, errores por campo (`aria-invalid`) y `setError("root.server")` para errores del back. Edición con `values` (no `defaultValues`).
- Schemas del front espejan los del back (mismas reglas y mensajes).
- Filtros del listado sincronizados con la URL (`useSearchParams`): así se pueden compartir y sobreviven al F5.
- Logout: `signOut()` y después `window.location.replace("/login")` (como el profe: limpia la caché de RTK Query).
- Tailwind v4 con `@theme` (colores de marca propios). Responsive mobile-first. Estados de carga, vacío y error en cada pantalla.

### 6.3 `vite.config.ts`

```ts
server: { proxy: { "/api": "http://localhost:3000" } }
```

## 7. Variables de entorno

### `backend/.env.example` (se commitea, sin valores reales)

```bash
PORT=3000
NODE_ENV=development
MONGODB_URI=
# Generar con: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
BETTER_AUTH_SECRET=
# URL publica del FRONT. Local: http://localhost:5173
BETTER_AUTH_URL=http://localhost:5173
# OAuth App de GitHub (una para local y otra para produccion)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
# Opcional: Google OAuth (si estan vacias, el login con Google se desactiva)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
# Solo para npm run seed (usuarios de prueba)
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
SEED_USER_EMAIL=
SEED_USER_PASSWORD=
```

El frontend **no tiene `.env`**: no le hace falta ninguna variable.

## 8. Seed

`backend/scripts/seed.ts` (`npm run seed`):

1. Crea el usuario admin y el usuario común con `auth.api.signUpEmail` (si ya existen, los saltea).
2. Al admin le pone `role: "admin"` directo en la colección `user`.
3. Inserta unas 15 películas de ejemplo con `createdBy` = id del admin, solo si la colección está vacía.

Flujo: se prueba todo contra la base de **dev**. Cuando el deploy está listo, se corre **una vez contra la de producción** para que los usuarios de prueba existan de verdad en Render:

```bash
cd ~/source/"Repos VS code"/"TP2 - Peliculas - MYDW"/tp2-peliculas/backend
MONGODB_URI="<uri de prod>" npm run seed   # la URI se pega en la terminal, nunca en un archivo versionado
```

## 9. Deploy en Render

| Servicio | Config |
|---|---|
| Backend (Web Service) | Root `backend` · Build `npm install --include=dev && npm run build` · Start `npm start` · Env: `NODE_ENV=production`, `NODE_VERSION=22`, `MONGODB_URI`, `BETTER_AUTH_SECRET` (**nuevo**, distinto al de local), `BETTER_AUTH_URL=https://<front>.onrender.com`, `GITHUB_*` de la OAuth App **de producción**, `GOOGLE_*` |
| Frontend (Static Site) | Root `frontend` · Build `npm install && npm run build` · Publish `dist` · Env: `NODE_VERSION=22` · Rewrites **en este orden**: `/api/*` → `https://<back>.onrender.com/api/*` (Rewrite) y `/*` → `/index.html` (Rewrite) |
| Atlas | Network Access `0.0.0.0/0` |
| GitHub OAuth | 2 apps. Callback local `http://localhost:5173/api/auth/callback/github`, prod `https://<front>.onrender.com/api/auth/callback/github` |
| Google OAuth | 1 cliente web con los 2 redirect URIs (`/api/auth/callback/google` en local y prod). Pantalla de consentimiento **publicada** ("Publish app" → In production) con scopes básicos (openid, email, profile), **sin logo** (subir logo dispara la verificación de Google). Respaldo: modo Testing + Gmail del profe como test user |
| Keep-alive (opcional, después del deploy) | Ping externo (ej. UptimeRobot) a `https://<back>.onrender.com/health` cada 10 min para que el plan free no se duerma |
