# PLAN — Fases de implementación

Cada fase termina en un **punto de corte**: Claude Code frena, da los comandos de prueba (Git Bash, con `cd`) y los mensajes de commit sugeridos. Nacho prueba, commitea, pushea y recién ahí se pasa a la fase siguiente.

Estado: ver la tabla del final de este archivo.

---

## F0 — Repo limpio

- [ ] Carpetas `backend/` y `frontend/` vacías, `README.md` esqueleto, `docs/`, `CLAUDE.md`.
- [ ] `.gitignore` raíz: `node_modules/`, `dist/`, `.env`, `.env.*` (menos `!.env.example`), `.DS_Store`, `*.log`.
- [ ] Verificar que no haya ningún `.env` antes del primer commit.

Commits:
- `chore: init repo with gitignore and folder structure`
- `docs: add project spec and plan`

## F1 — Backend base

- [ ] `npm init`, `"type": "module"`, `"engines": { "node": ">=22" }`, scripts `dev` / `build` / `start` / `seed`.
- [ ] Dependencias: `express dotenv mongoose zod better-auth @better-auth/mongo-adapter mongodb`. Dev: `typescript tsx @types/express @types/node`.
- [ ] `tsconfig.json` igual al del profe (nodenext, strict, rootDir src, outDir dist).
- [ ] `src/config/db.ts` (connectMongoDB con logs), `src/server.ts` con `/health`.
- [ ] `.env.example` completo (SPEC §7).

Prueba: `npm run dev` y `curl http://localhost:3000/health`.

Commits:
- `chore(backend): init express + typescript project with esm`
- `feat(backend): add mongodb connection and health endpoint`

## F2 — Better Auth + roles

- [ ] `src/lib/auth.ts` (SPEC §5), con `requireEnv`.
- [ ] Montar `/api/auth/*splat` **antes** de `express.json()`.
- [ ] `src/types/auth.types.ts` (`SessionUser`, `UserRole`, `req.user`).
- [ ] `src/middlewares/auth.middleware.ts`: `authMiddleware`, `optionalAuth` (para `mine=true`) y `requireRole`.

Prueba (curl):
1. `GET /api/auth/ok` devuelve `{ ok: true }`.
2. `POST /api/auth/sign-up/email` crea un usuario con `role: "user"` (mirarlo en Atlas).

Commits:
- `feat(backend): configure better auth with email and admin plugin`
- `feat(backend): add auth and role middlewares`

## F3 — CRUD de películas

- [ ] `models/Movie.ts` (SPEC §3), con índices en `title`, `genre` y `createdBy`.
- [ ] `schemas/movie.schema.ts`: `GENRES`, `createMovieSchema`, `updateMovieSchema`, `listMoviesQuerySchema`.
- [ ] `middlewares/validate.ts`: `validateBody` y `validateQuery` (este último a `res.locals.query`).
- [ ] `lib/http-errors.ts`: helper `sendError(res, status, message, details?)` con el formato único (SPEC §4.3).
- [ ] `services/movies.service.ts`: list (filtro armado campo por campo, regex escapada, `Promise.all` find + count), findById, create, replace, update, delete.
- [ ] `controllers/movies.controller.ts`: solo HTTP.
- [ ] `routes/movies.routes.ts` + `routes/index.ts` montado en `/api/peliculas`.
- [ ] Extra: `router.query!("/", ...)` con `listMoviesBodySchema` (mismos filtros en el body), que llama al mismo service que el GET.

Prueba: archivo `backend/requests.http` (extensión REST Client) o curl, con todos los casos de la tabla SPEC §4.1, incluidos 400 / 401 / 403 / 404.

Commits:
- `feat(backend): add movie model and zod schemas`
- `feat(backend): add movies list with pagination, filters and search`
- `feat(backend): add movies crud protected by admin role`
- `feat(backend): add QUERY method for movies list with filters in body`

## F4 — Seed + dueño (dividida en F4a y F4b)

### F4a — Seed (no depende de P03)

- [x] `scripts/seed.ts` (SPEC §8): usuarios admin y user + 15 películas con `createdBy` del admin, solo si la colección está vacía.
- [x] `createdBy` desde `req.user.id` y `mine=true` en el listado (ya hechos en F3).

Commit: `feat(backend): add seed script for test users and movies`

### F4b — Regla del dueño (P03 resuelta: el profe dijo "Sí")

- [x] Escritura con `authMiddleware` + `requireRole("user", "admin")`.
- [x] `lib/ownership.ts` (`canModifyMovie`): el admin modifica todo; el user, solo lo suyo.
- [x] 403 "Solo podés modificar las películas que creaste" en PUT/PATCH/DELETE (entre el 404 y la escritura, en el controller).
- [x] Sin `ENFORCE_OWNERSHIP`: ya no hace falta (nunca llegó a crearse el archivo).

Commits:
- `feat(backend): allow users to write their own movies and restrict edits to the owner`
- `docs: update spec with owner rule approved by the professor`

## F5 — Frontend base

- [ ] `npx create-vite@latest frontend --template react-ts --no-immediate`, limpieza del template.
- [ ] Dependencias: `react-router react-hook-form @hookform/resolvers zod @reduxjs/toolkit react-redux axios better-auth tailwindcss @tailwindcss/vite`. Dev: `prettier prettier-plugin-tailwindcss oxlint`.
- [ ] `vite.config.ts` con el proxy de `/api`, `index.css` con `@theme`.
- [ ] `lib/api.ts`, `lib/auth-client.ts`, `store/` (moviesApi + store), `router/`, `layouts/Layout.tsx` (header con nav, user y logout), `NotFound`.

Commits:
- `chore(frontend): scaffold vite react ts with tailwind`
- `feat(frontend): add router, layout and auth client`

## F6 — Auth en el front

- [ ] `schemas/auth.schema.ts` (login, register: email, password mín. 8 + confirmación; usuario/nombre/apellido se sumaron en F8b).
- [ ] `Login` (email, GitHub, Google si está habilitado, manejo de `?error=`), `Register`, logout.
- [ ] `ProtectedRoute` con `isPending` y `roles`.
- [ ] `Profile`.

Commits:
- `feat(frontend): add login and register with react hook form and zod`
- `feat(frontend): add protected routes by session and role`

## F7 — Listado y detalle

- [ ] `moviesApi`: `getMovies(params)`, `getMovieById`, mutations con tags.
- [ ] `MoviesList`: `MovieCard`, `MovieFilters` (search con debounce, género, disponible, rating mínimo, orden), `Pagination`, todo sincronizado con `useSearchParams`.
- [ ] `MovieDetail`.

Commits:
- `feat(frontend): add movies list with filters and pagination`
- `feat(frontend): add movie detail page`

## F8 — ABM de películas y usuarios

- [x] `schemas/movie.schema.ts` (espejo del back), mutations en `moviesApi` (crear, editar con PUT, eliminar) y `MovieForm` (alta y edición con `values`, select de género, date input, checkbox).
- [x] `/mis-peliculas` (`MyMovies`, cualquier usuario logueado): ABM de **sus** películas (`mine=true`) reutilizando `MovieForm`. Link "Mis películas" en el header si hay sesión.
- [x] `/admin` (`AdminMovies`, solo admin): ABM de **todas**, con filtro "Mis películas"; eliminar con confirmación; errores de `unwrap()`.
- [x] `/admin/usuarios` (`AdminUsers`, solo admin): `authClient.admin.listUsers` + `setRole` (no dejar que un admin se quite el rol a sí mismo).
- [x] Rutas protegidas en el router (`ProtectedRoute` con y sin `roles`); user común en `/admin` va a `/perfil` con aviso.

Commits:
- `feat(frontend): add movie form and my movies page`
- `feat(frontend): add admin movies crud`
- `feat(frontend): add admin page to change user roles`

## F8b — Nombre de usuario y autor visible

- [x] Backend: plugin `username()` + `user.additionalFields` (`firstName`, `lastName`, opcionales en el back y obligatorios en el Zod del registro); login sigue por email. Usuarios de GitHub/Google sin username (se muestra su `name`).
- [x] Backend: `author: { id, username, name }` en GET lista, GET por id y QUERY, con **una** consulta a `user` (sin populate ni email).
- [x] Seed: `admin` (Admin Peliculas) y `usuario` (Usuario Prueba); si existen, se actualizan.
- [x] Frontend: registro con usuario, nombre, apellido, email y contraseña; `usernameClient()`; errores de username en español en su campo.
- [x] Frontend: columna Autor ("Vos" / `@username` / "—"), "Cargada por" en el detalle, usuario/nombre/apellido en el perfil y columna Usuario en `/admin/usuarios`.

Commits:
- `feat(auth): add username, first name and last name to users`
- `feat(backend): include movie author in responses`
- `feat(frontend): add username to register and show movie author`

## F8c — Superadmin, gestión de usuarios e ID visible

- [x] Backend: control de acceso del plugin admin (`lib/permissions.ts`): `superadmin` con permisos completos de usuarios, `admin` solo `list`, `user` nada. Lo aplica Better Auth (403 si un admin llama `set-role`/`ban-user`/`remove-user` a mano).
- [x] Backend: `requireRole` de escritura y el bypass de ownership incluyen `superadmin`. `GET /api/config` no cambia (el front saca el rol de la sesión).
- [x] Seed: superadmin (`SEED_SUPERADMIN_*`, username `superadmin`), re-ejecutable; `.env.example` actualizado.
- [x] Usuario eliminado: sus películas quedan; el autor sale con `username` y `name` en `null` ("—").
- [x] Frontend: superadmin entra a `/admin` como admin (`lib/roles.ts`).
- [x] Frontend: `/admin/usuarios` con acciones solo para el superadmin (rol, dar de baja / reactivar, eliminar con confirmación), columna Estado y la propia fila bloqueada; el admin ve la tabla sin acciones.
- [x] Frontend: login con cuenta dada de baja muestra el mensaje en español.
- [x] Frontend: "ID: <id>" con botón Copiar en el detalle de película.

Commits:
- `feat(auth): add superadmin role with access control for user management`
- `feat(frontend): add user management actions for superadmin`
- `feat(frontend): show movie id with copy button in detail page`

## F8d — Permisos por rol objetivo, perfil editable, vincular cuentas y modales

- [x] Backend: `admin` pasa a tener `user: ["list", "ban", "delete"]` (sin `set-role`); superadmin sigue completo.
- [x] Backend: hook `hooks.before` + `createAuthMiddleware` (`lib/user-management-guard.ts`) en `set-role`, `ban-user`, `unban-user` y `remove-user`: el admin solo gestiona usuarios con rol `user` (403 en español); nadie cambia su propio rol (400).
- [x] Backend: `account.accountLinking` con `enabled`, `trustedProviders` y `allowDifferentEmails: true`; `mapProfileToUser` de GitHub (nombre y apellido) y de Google, sin generar username.
- [x] Frontend `/admin/usuarios`: el admin no ve superadmin y solo actúa sobre `user`; el superadmin ve y gestiona a todos menos a sí mismo. Estado visible para ambos.
- [x] Frontend `/perfil`: formulario (RHF + Zod) de usuario / nombre / apellido con `updateUser`, aviso si falta el username, email y rol solo lectura, vincular GitHub / Google con `linkSocial` (Google solo si está habilitado).
- [x] Frontend: ID arriba de la tarjeta del detalle ("ID: #<id>" + Copiar).
- [x] Frontend: `Modal` y `ConfirmDialog` reutilizables (sin librerías); todas las confirmaciones en modal; crear y editar película dentro de un modal.

Commits:
- `feat(auth): restrict admins to managing regular users and let users link accounts`
- `feat(frontend): add reusable modal and confirm dialog`
- `feat(frontend): move movie form and confirmations into modals`
- `feat(frontend): add editable profile and account linking`
- `feat(frontend): apply role rules in users admin page`

## F8e — Perfil con lápiz, contraseña para cuentas sociales, completar perfil y pósters

- [x] `/perfil` en modo lectura con lápiz en "Usuario" y "Nombre" (modal con Zod, `updateUser`, error de username en su campo); email y rol solo lectura. Se quitó el aviso "Completá tu nombre de usuario" (lo reemplaza `/completar-perfil`).
- [x] Backend: `POST /api/perfil/contrasena` (`authMiddleware`, Zod, `auth.api.setPassword`; 400 si ya tiene cuenta `credential`).
- [x] Frontend: en Cuentas vinculadas, "Email y contraseña — Agregar" (modal con contraseña + confirmación).
- [x] `/completar-perfil` obligatorio (`ProfileGate` + `CompleteProfile`): sin username, todas las rutas redirigen ahí; con username, redirige al catálogo. Nombre y apellido precargados.
- [x] Seed: `posterUrl` en las películas (TMDB / Wikimedia, verificadas) y actualización por título de las ya existentes. Las 15 con póster.

Commits:
- `feat(backend): add endpoint to set a password on social accounts`
- `feat(frontend): make profile read-only with edit modals and add password to social accounts`
- `feat(frontend): require completing the profile before using the app`
- `chore(backend): add movie posters to the seed`

## F12 — Marca Cinema 24, íconos sociales, footer y rol del admin ✅

- [x] Marca: nombre "Cinema 24" (title, header con logo, privacidad, README), favicon y apple-touch-icon (se borró el favicon de Vite), paleta en `@theme` con contraste revisado, encabezado del catálogo con "Crear cuenta" sin sesión, logo arriba de login y registro.
- [x] Botones de Google y GitHub con íconos oficiales (`SocialButton`, `SocialLogin`) en login, registro (antes no tenía) y perfil (cuentas vinculadas con ícono).
- [x] Footer "© 2026 Cinema 24 · Privacidad" en `Footer`, pegado al fondo en Layout y `AuthCard`; se sacó el link de privacidad de dentro de la tarjeta de login/registro.
- [x] Rol del admin: `permissions.ts` suma `user:set-role`; el hook solo deja al admin ascender `user` → `admin` (otro rol → 403); `/admin/usuarios` muestra el select (Usuario / Administrador) al admin solo en filas `user`.
- Probado con curl contra el dev server: admin asciende user → admin (200) y después no puede tocarlo (403); set-role a superadmin (403); sobre sí mismo (400); user (403).

Commits:
- `feat(backend): let admins promote users to admin`
- `feat(frontend): add cinema 24 branding, palette and favicon`
- `feat(frontend): add social login buttons with brand icons and footer`
- `docs: update readme, spec and plan for cinema 24`

## F9 — OAuth ✅

- [x] GitHub OAuth App local, probar el login, vinculación de cuentas y `email_not_found`.
- [x] Google: proyecto en Google Cloud, pantalla de consentimiento (scopes básicos, **sin logo**), cliente OAuth web con redirect URIs local y prod, provider condicional. **Publicar la app** (In production). Respaldo: Testing + Gmail del profe como tester.

Commits:
- `feat(auth): add google social login`
- `fix(auth): ...` (lo que aparezca)

## F10 — Deploy ✅

Preparación hecha (F10 prep, commiteada): página pública `/privacidad` con links; `trustedOrigins` y cookies seguras explícitas en `lib/auth.ts`; `docs/DEPLOY.md` con la configuración de Render, variables, rewrites, callbacks de OAuth y comando del seed de producción. Deploy hecho en Render:

- [x] Atlas: base de prod y `0.0.0.0/0`.
- [x] Render backend → verificar `/api/auth/ok`.
- [x] Render frontend + rewrites en orden.
- [x] OAuth Apps de producción (GitHub + Google), actualizar `BETTER_AUTH_URL`.
- [x] Seed en prod (`MONGODB_URI="<prod>" npm run seed`, la URI solo en la terminal) y login probado con los 2 usuarios de prueba.
- [x] Opcional: keep-alive con UptimeRobot a `/health` cada 10 min.
- [x] Recorrido completo en producción: F5 en `/admin` y `/peliculas/:id`, login con email, GitHub y Google, ABM, 403 con user común.

Verificado desde afuera (2026-11-20): `/health` del back, rewrite `/api/*` (catálogo y `/api/config` con `googleEnabled: true`), fallback de la SPA (`/peliculas`, `/privacidad`) y `QUERY` a través de Render. Login con GitHub y con Google probado en producción por el alumno.

Commit: `docs: add render deploy guide`.

## F11 — Cierre ✅

- [x] README final (ver `CLAUDE.md` §README).
- [x] Auditoría de secretos en todo el historial: `git log -p | grep -iE "mongodb\+srv://[^<]|BETTER_AUTH_SECRET=.+|CLIENT_SECRET=.+"` tiene que dar vacío (o solo líneas vacías del `.env.example`).
- [x] Checklist final contra `CONSIGNA.md`, punto por punto.

Hecho: README completo (con los desvíos aprobados y las limitaciones), auditoría de secretos sin hallazgos (informe en el chat) y `docs/CHECKLIST.md`.

Commits:
- `docs: complete readme with endpoints, urls and test users`
- `docs: add consigna checklist and close phases f9 to f11`

---

| Fase | Estado |
|---|---|
| F0 | ✅ |
| F1 | ✅ |
| F2 | ✅ |
| F3 | ✅ |
| F4a (seed) | ✅ |
| F4b (dueño) | ✅ |
| F5 | ✅ |
| F6 | ✅ |
| F7 | ✅ |
| F8 | ✅ |
| F8b (usuario y autor) | ✅ |
| F8c (superadmin) | ✅ |
| F8d (permisos por rol, perfil, vincular, modales) | ✅ |
| F8e (perfil con lápiz, contraseña social, completar perfil, pósters) | ✅ |
| F9 | ✅ |
| F10 prep (privacidad, ajustes de producción, DEPLOY.md) | ✅ |
| F10 (deploy en Render) | ✅ |
| F11 | ✅ |
| F12 (marca, íconos sociales, footer, rol del admin) | ✅ (pendiente de prueba visual y commit) |
