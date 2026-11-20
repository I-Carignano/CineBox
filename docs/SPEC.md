# SPEC — Cinema 24, app de películas (TP2)

Especificación técnica del sistema. Si algo de acá contradice a `CONSIGNA.md`, **gana la consigna**: avisar y corregir este archivo.

## 1. Qué es la app

Catálogo de películas full stack.

- **Cualquiera (sin sesión):** ve el listado con búsqueda, filtros y paginación, y el detalle de cada película.
- **`user` (rol por defecto al registrarse):** lo mismo, más su perfil. **Crea películas (quedan a su nombre) y edita/borra solo las suyas** desde `/mis-peliculas` (opcional "cada usuario edita solo sus registros").
- **`admin`:** crea, edita y borra **todas** las películas desde `/admin` (con filtro "Mis películas"). En `/admin/usuarios` (F8d) **no ve a los superadmin**, ve a los admin sin acciones, y sobre los usuarios con rol `user` puede dar de baja, reactivar, eliminar y **ascender a `admin`** (F12: es el único cambio de rol que puede hacer, y después no puede tocar a ese admin).
- **`superadmin` (F8c):** todo lo del admin, más **gestionar usuarios** en `/admin/usuarios`: ve a todos y, sobre cualquiera menos sí mismo (admins incluidos), cambia el rol (`user` / `admin` / `superadmin`), da de baja (ban), reactiva (unban) y elimina. Un usuario eliminado deja sus películas en el catálogo (su autor se muestra como "—"). Nadie puede cambiarse su propio rol. Se crea con el seed (`SEED_SUPERADMIN_*`) o lo asigna otro superadmin.
- **Perfil (F8d, F8e):** cualquier usuario logueado edita su nombre de usuario, nombre y apellido en `/perfil` (con el lápiz, en un modal) y puede vincular cuentas de GitHub/Google. Quien entró con GitHub/Google puede **agregar email y contraseña** para entrar también así. El email no se edita.
- **Perfil completo obligatorio (F8e):** con sesión y sin nombre de usuario (cuentas sociales), todas las rutas redirigen a `/completar-perfil`.

> **Desvío aprobado de la consigna.** La consigna dice "user: solo puede leer" y "escritura con `requireRole("admin")`". El profe aprobó (respuesta a P03: "Sí") este esquema, en el que el `user` también escribe sobre lo suyo. Conviene guardar esa respuesta (captura o mail) por si hace falta mostrarla; el README (F11) lo aclara.

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
| `author` | — (no se guarda) | — | **Solo en las respuestas** de GET lista, GET por id y QUERY: `{ id, username, name }` (ver abajo) |

**`author` (F8b).** El service junta los `createdBy` distintos de la página, hace **una** consulta a la colección `user` de Better Auth (proyectando solo `username` y `name`, sin populate ni email) y agrega a cada película `author: { id, username, name }`: `username` es el username real o `null` (los usuarios de GitHub/Google no tienen y no se les inventa uno) y `name` es el nombre o `null` (si el usuario ya no existe, ambos `null`). El front muestra `@username` si existe, si no `name`, si no "—". POST/PUT/PATCH devuelven la película sin `author`.

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
| POST | `/api/peliculas` | user, admin o superadmin | 201 película creada (`createdBy` = el usuario) | 400 Zod, 401 |
| PATCH | `/api/peliculas/:id` | user (solo las suyas), admin y superadmin (todas) | 200 película actualizada | 400, 401, 403 (user sobre una ajena), 404 |
| PUT | `/api/peliculas/:id` | user (solo las suyas), admin y superadmin (todas) | 200 | igual que PATCH, pero exige el objeto completo (`createMovieSchema`) |
| DELETE | `/api/peliculas/:id` | user (solo las suyas), admin y superadmin (todas) | 204 sin body | 400, 401, 403 (user sobre una ajena), 404 |
| GET | `/api/auth/ok` | — | 200 `{ ok: true }` (healthcheck de Better Auth) | — |
| POST | `/api/perfil/contrasena` | Logueado (cualquier rol) | 204 sin body. Body `{ newPassword }` (8 a 128 caracteres): agrega la cuenta de email y contraseña ("credential") al usuario logueado con `auth.api.setPassword`, para que quien entró con GitHub/Google pueda entrar también con su email | 400 Zod, 400 "Tu cuenta ya tiene email y contraseña" (ya tiene cuenta credential), 401 |
| GET | `/api/config` | Público | 200 `{ googleEnabled }` (el front lo usa para mostrar u ocultar el botón de Google, porque no tiene `.env`) | — |
| GET | `/health` | — | 200 `{ status, uptimeSeconds, timestamp }` | — |
| * | `/api/auth/*` | Better Auth | sign-up/email, sign-in/email, sign-in/social, sign-out, get-session, callback/github, callback/google, admin/* (list-users, set-role, ban-user, unban-user, remove-user: **403** si el rol no tiene el permiso, ver §5) | — |

PUT y PATCH: la consigna dice "PUT / PATCH". Implementamos **los dos** con la semántica correcta (PUT reemplazo completo, PATCH parcial). **El front edita con PUT**: el formulario siempre manda el objeto completo, y con PUT se puede borrar un póster o una sinopsis ya cargados (con PATCH, un campo omitido significa "no tocar"). PATCH queda disponible en la API.

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
| Rol no habilitado para la ruta | 403 | "No tenés permisos para realizar esta acción" |
| `user` sobre una película ajena | 403 | "Solo podés modificar las películas que creaste" |
| Error inesperado | 500 | "Error interno del servidor" (el detalle va a `console.error`, nunca al cliente) |

### 4.4 Middlewares de escritura (orden)

```ts
const canWrite = [authMiddleware, requireRole("user", "admin", "superadmin")];
router.post("/", canWrite, validateBody(createMovieSchema), createMovie);
router.put("/:id", canWrite, validateBody(createMovieSchema), replaceMovie);
router.patch("/:id", canWrite, validateBody(updateMovieSchema), updateMovie);
router.delete("/:id", canWrite, deleteMovie);
```

**Regla del dueño (P03, resuelta: el profe aprobó el esquema).** `requireRole("user", "admin", "superadmin")` solo exige estar logueado con un rol conocido; el permiso fino va en el **controller**: buscar por id → 404 si no existe → 403 si el rol no es `admin` ni `superadmin` y `createdBy !== req.user.id` → recién ahí modificar. Admin y superadmin no tienen ese chequeo. La regla vive en `lib/ownership.ts` (`canModifyMovie`).

| | `user` | `admin` | `superadmin` |
|---|---|---|---|
| Leer catálogo y detalle | ✅ (también sin sesión) | ✅ | ✅ |
| Crear (`createdBy` = él) | ✅ | ✅ | ✅ |
| Editar / borrar películas | Solo las suyas | Todas | Todas |
| Ver la lista de usuarios | ❌ | ✅ (sin los superadmin) | ✅ (todos) |
| Dar de baja, reactivar, eliminar usuarios | ❌ | Solo usuarios con rol `user` (si no, 403) | Todos menos él mismo |
| Cambiar roles | ❌ | Solo `user` → `admin` (cualquier otro caso, 403) | Todos menos él mismo |

## 5. Better Auth (backend)

`src/lib/auth.ts`, basado en el del profe:

- `baseURL: requireEnv("BETTER_AUTH_URL")`: es la URL **del front**.
- `database: mongodbAdapter(client.db(), { client })`.
- `emailAndPassword: { enabled: true }` (mínimo 8 caracteres por defecto).
- `socialProviders.github` (obligatorio) y `socialProviders.google` (opcional, solo si están las variables `GOOGLE_*`; si faltan, no se registra el provider y el botón de Google se oculta).
- **Control de acceso (F8c)**, `src/lib/permissions.ts`: `createAccessControl(defaultStatements)` y tres roles sobre los usuarios: `superadmin` = `adminAc.statements` (permisos completos), `admin` = `{ user: ["list", "set-role", "ban", "delete"] }` (F12 sumó `set-role`; el hook limita a qué rol puede ascender), `user` = `{ user: [] }`. Lo aplica Better Auth en cada endpoint `/api/auth/admin/*`: un `user` que llame cualquiera de ellos recibe **403**, aunque salte el front. Banear/eliminarse a uno mismo lo rechaza el propio plugin (400).
- **Hook sobre el usuario objetivo (F8d)**, `src/lib/user-management-guard.ts`, registrado con `hooks.before` + `createAuthMiddleware`: el permiso dice qué acciones puede hacer cada rol, pero no sobre quién. Antes de `/admin/set-role`, `ban-user`, `unban-user` y `remove-user` el hook busca al usuario objetivo y aplica: (1) nadie puede cambiarse su propio rol (**400** "No podés cambiarte el rol a vos mismo"); (2) si quien llama es `admin` y el objetivo no tiene rol `user` (admin o superadmin), **403** "Un administrador solo puede gestionar usuarios con rol usuario". (3, F12) si quien llama es `admin` y la acción es `set-role`, el rol nuevo tiene que ser exactamente `"admin"` (el objetivo ya pasó la regla 2, o sea es `user`): cualquier otro rol (`superadmin`, `user`, un array) da **403** "Un administrador solo puede ascender usuarios a administrador". El superadmin no tiene las reglas 2 y 3. Sin sesión o sin `userId`, el hook no hace nada y responde el endpoint (401/400). Un usuario dado de baja no puede iniciar sesión (`BANNED_USER`) y se le cierran las sesiones abiertas. Eliminar un usuario no toca sus películas (`createdBy` queda como string): el autor sale con `username` y `name` en `null`.
- `account.accountLinking: { enabled: true, trustedProviders: ["github", "google"], allowDifferentEmails: true }`. Con `trustedProviders`, entrar con GitHub/Google con el mismo email de una cuenta existente las une sin `account_not_linked`. Con `allowDifferentEmails`, un usuario **ya logueado** puede vincular desde `/perfil` (`linkSocial`) una cuenta de GitHub/Google que tiene otro email (Better Auth advierte que esto puede facilitar toma de cuentas: solo aplica al vínculo manual con sesión iniciada).
- `mapProfileToUser`: GitHub separa `profile.name` en `firstName` (primera palabra) y `lastName` (el resto); Google usa `given_name` y `family_name`. **No se genera username**: lo completa el usuario en `/perfil`. Solo aplica a cuentas nuevas (no completa las ya creadas).
- `plugins: [admin({ ac, roles, defaultRole: "user", adminRoles: ["admin", "superadmin"] }), username({ minUsernameLength: 3, maxUsernameLength: 30, usernameValidator: /^[a-zA-Z0-9_.]+$/, displayUsername: false })]`. El plugin guarda `username` normalizado a minúsculas y único (error `USERNAME_IS_ALREADY_TAKEN`). El login sigue siendo **por email** (el plugin expone `/sign-in/username`, pero el front no lo usa).
- `user.additionalFields`: `firstName` y `lastName` (string, `required: false`, `input: true`, para no romper el alta por GitHub/Google; el registro por email los exige en el Zod del front). El registro manda `name = "firstName lastName"`. Los usuarios de GitHub/Google no tienen `username`, `firstName` ni `lastName`: para mostrarlos se usa su `name`.
- En `server.ts`: `app.all("/api/auth/*splat", toNodeHandler(auth))` **antes** de `express.json()`.
- Producción (F10 prep, ver `docs/DEPLOY.md`): `baseURL = BETTER_AUTH_URL` (la URL del **front**); `trustedOrigins: [origen de esa URL]` (el navegador manda `Origin` = front a través del rewrite); `advanced.useSecureCookies` solo si la URL empieza con `https://`. No se usa `trust proxy`: el código no lee `req.ip` ni `req.secure`. El back escucha en `process.env.PORT`; `npm run build` → `dist/`, `npm start` → `node dist/server.js`.

## 6. Frontend

### 6.1 Rutas

| Ruta | Página | Acceso | Layout |
|---|---|---|---|
| `/` | redirect a `/peliculas` | — | — |
| `/peliculas` | `MoviesList`: encabezado de marca ("Cinema 24" + bajada; botón "Crear cuenta" si no hay sesión), grilla, búsqueda, filtros, paginación | Pública | Sí |
| `/peliculas/:id` | `MovieDetail` (incluye "Cargada por @usuario") | Pública | Sí |
| `/login` | `Login`: email + botones "Iniciar sesión con Google" (si `googleEnabled`) y "Iniciar sesión con GitHub" (`SocialLogin`) | Pública (si hay sesión, redirige) | No (`AuthCard`: logo + footer) |
| `/register` | `Register`: nombre de usuario, nombre, apellido, email, contraseña + confirmación, y los mismos botones sociales (F12) | Pública | No (`AuthCard`) |
| `/completar-perfil` | `CompleteProfile`: email (solo lectura), nombre y apellido (precargados desde GitHub/Google, editables, obligatorios) y nombre de usuario (obligatorio). "Guardar y continuar" → `authClient.updateUser` → catálogo (recarga completa). Es la única pantalla que se ve sin username; tiene "Cerrar sesión". Sin sesión → `/login`; con username → `/peliculas` | Logueado sin username | No |
| `/perfil` | `Profile`: datos en modo lectura. Lápiz junto a "Usuario" y junto a "Nombre" (nombre + apellido): abre un `Modal` con el/los campos (RHF + Zod, "Guardar cambios" / "Cancelar") y guarda con `authClient.updateUser` (`name = "Nombre Apellido"`); error de username en su campo. Email y rol: solo lectura, sin lápiz. Cuentas vinculadas: "Vincular GitHub" / "Vincular Google" (`linkSocial`, Google solo si `googleEnabled`) y, si no tiene cuenta `credential`, "Email y contraseña — Agregar" (modal con contraseña + confirmación → `POST /api/perfil/contrasena`: "Vas a poder entrar con <email> y esta contraseña") | Logueado | Sí |
| `/mis-peliculas` | `MyMovies`: ABM de **sus** películas (`mine=true`), mismo `MovieForm` que el admin | Logueado (cualquier rol) | Sí |
| `/admin` | `AdminMovies`: ABM de **todas** las películas, filtro "Mis películas" | admin o superadmin | Sí |
| `/admin/usuarios` | `AdminUsers`: listado (usuario, nombre, email, rol, estado). **Superadmin:** ve a todos; en cada fila (menos la suya, sin acciones) select de rol (`setRole`), "Dar de baja" / "Reactivar" (`banUser` / `unbanUser`) y "Eliminar" (`removeUser`), también sobre admins. **Admin:** no ve filas de superadmin (`listUsers` con `filterField: "role"`, `filterOperator: "ne"`, `filterValue: "superadmin"`, más un filtro de respaldo en el front); acciones de baja / reactivar / eliminar solo en filas con rol `user`; en esas mismas filas, select de rol con **Usuario / Administrador** (F12: solo puede ascender; en el resto de las filas, el rol es texto). Ambos ven la columna Estado. Cambiar rol, dar de baja y eliminar piden confirmación en un modal (reactivar no) | admin o superadmin | Sí |
| `/privacidad` | `Privacy`: texto corto de privacidad (datos que se guardan: email, nombre, apellido, usuario y contraseña cifrada; para qué; no se comparten; cómo pedir la baja a un admin). Link "Privacidad" en el footer (`Footer`, usado por el Layout y por `AuthCard`) | Pública, también sin username | Sí |
| `*` | `NotFound` | — | Sí |

**`ProfileGate`** (`router/ProfileGate.tsx`) envuelve todas las rutas menos `/completar-perfil` y `/privacidad`: con sesión y sin `username` redirige a `/completar-perfil` (cualquier ruta, incluido el catálogo). Mientras la sesión carga no bloquea nada, para que el catálogo público no espere.
Header: "Mis películas" si hay sesión; "Admin" solo si el rol es admin o superadmin (`lib/roles.ts`).
Login con cuenta dada de baja: "Tu cuenta fue dada de baja. Contactá a un administrador." (`BANNED_USER` en `lib/auth-errors.ts`).
Detalle de película: primera línea dentro de la tarjeta, antes del póster y el título: "ID: #<id>" con botón "Copiar" (`CopyId`, copia el ID sin el `#`), útil para probar la API.
Usuario común en `/admin` → `Navigate` a `/perfil` y aviso "No tenés permisos" (con `state`).
Columna **Autor** del ABM: "Vos" si la película es mía; si no, `@username` si existe, si no su `name` (GitHub/Google), si no "—". Mismo formato en el detalle.
Errores de username en el registro (ya usado, inválido, corto/largo) se muestran en el campo "Nombre de usuario", traducidos en `lib/auth-errors.ts`.

**Marca (F12).** La app se llama **Cinema 24**. Assets en `frontend/public/cinema24-brand/` (favicon.ico, favicon-32.png, apple-touch-icon.png, icon-512.png, logo-cinema24.png para fondo claro y logo-cinema24-dark-bg.png para fondo oscuro); `index.html` referencia favicon.ico, favicon-32.png y apple-touch-icon.png. Header oscuro con el logo para fondo oscuro (alto 36 px, link al catálogo); login y registro llevan el logo claro arriba de la tarjeta. Paleta en `@theme` de `index.css`: **primary** `brand-600` #C5162E (botones, links, acentos; hover `brand-700` #A11226; anillo de foco `brand-500` #E0364C), **ink** #211B1C (header y textos fuertes), **rose** `brand-50` #FBECEE (fondo de página; `brand-100` #F6D3D8 para fondos suaves) y blanco para las tarjetas. Contraste revisado (WCAG): blanco sobre primary 5.9:1, primary sobre rosa 5.2:1, blanco sobre ink 17:1; por eso los textos secundarios son `slate-600` (6.6:1 sobre el rosa) y los errores `red-700`.
**Botones sociales (F12).** `SocialButton` (ícono SVG inline oficial de Google o GitHub + texto, ancho completo o compacto) y `SocialLogin` (separador "o" + botones, compartido por login y registro). En Perfil → Cuentas vinculadas, cada cuenta vinculada muestra su ícono y las que faltan son botones "Vincular Google" / "Vincular GitHub".
**Footer (F12).** `Footer`: "© 2026 Cinema 24 · Privacidad", chico y centrado, con `mt-auto` en un contenedor `min-h-screen flex flex-col` (main `flex-1`): queda pegado al fondo de la ventana y separado de las tarjetas.

### 6.2 Reglas

- `lib/api.ts`: `axios.create({ baseURL: "/api" })`. **Nunca** la URL del backend.
- `lib/auth-client.ts`: `createAuthClient({ plugins: [adminClient({ ac, roles }), usernameClient(), inferAdditionalFields(...)] })`, sin `baseURL`. `lib/permissions.ts` del front repite los roles del back solo para que el cliente acepte `superadmin`; el permiso real lo aplica el backend.
- Sesión: **solo** `useSession()`. Nada en `localStorage`.
- Datos de películas: RTK Query (`store/moviesApi.ts`) con `providesTags` / `invalidatesTags`. El listado recibe los filtros como argumento de la query, así cada combinación queda en su propia entrada de caché.
- Diálogos (F8d): `components/Modal.tsx` (sobre el `<dialog>` nativo con `showModal()`: fondo oscuro, caja centrada, cierra con Escape, click afuera o Cancelar; sin librerías) y `components/ConfirmDialog.tsx` (pregunta + resumen + "Sí, …" / "Cancelar"). Todas las confirmaciones usan `ConfirmDialog` (eliminar película, baja / eliminar usuario, cambiar rol) y el `MovieForm` de crear / editar se abre dentro de un `Modal`.
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
SEED_SUPERADMIN_EMAIL=
SEED_SUPERADMIN_PASSWORD=
```

El frontend **no tiene `.env`**: no le hace falta ninguna variable.

## 8. Seed

`backend/scripts/seed.ts` (`npm run seed`):

1. Crea el superadmin (`superadmin`, Super Admin), el admin (`admin`, Admin Peliculas) y el usuario común (`usuario`, Usuario Prueba) con `auth.api.signUpEmail`. Si ya existen, **les actualiza** `username`, `firstName`, `lastName` y `name` (re-ejecutable).
2. Al superadmin y al admin les pone `role` directo en la colección `user` (y los reactiva si estaban dados de baja).
3. **Películas (F12b):** el seed trae 31 películas de ejemplo. Por cada una, si **no existe** una con ese título se inserta con `createdBy` = id del admin del seed; si ya existe, no se inserta de nuevo (re-ejecutable, sin duplicar). Las películas que cargaron los usuarios no se tocan. Antes decidía por "colección vacía"; ahora es por título, así se pueden sumar películas nuevas al seed sin vaciar nada.
4. **Pósters:** cada película del seed trae `posterUrl` (de `image.tmdb.org/t/p/w500/...`; solo algunas de Wikimedia). A las que ya existen, el seed les sincroniza el `posterUrl` buscándolas por **título** y solo si es distinto (`updateOne({ title, posterUrl: { $ne: posterUrl } }, { $set: { posterUrl } })`: no modifica nada más, ni `updatedAt`, en una segunda corrida). Las 31 tienen póster. El log final es `películas nuevas: N, pósters actualizados: M` (segunda corrida: 0 y 0).

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
