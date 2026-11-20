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

- [ ] `schemas/auth.schema.ts` (login, register: name 2–80, email, password mín. 8 + confirmación).
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

- [ ] `schemas/movie.schema.ts` (espejo del back), mutations en `moviesApi` (crear, editar con PATCH, eliminar) y `MovieForm` (alta y edición con `values`, select de género, date input, checkbox).
- [ ] `/mis-peliculas` (`MyMovies`, cualquier usuario logueado): ABM de **sus** películas (`mine=true`) reutilizando `MovieForm`. Link "Mis películas" en el header si hay sesión.
- [ ] `/admin` (`AdminMovies`, solo admin): ABM de **todas**, con filtro "Mis películas"; eliminar con confirmación; errores de `unwrap()`.
- [ ] `/admin/usuarios` (`AdminUsers`, solo admin): `authClient.admin.listUsers` + `setRole` (no dejar que un admin se quite el rol a sí mismo).
- [ ] Rutas protegidas en el router (`ProtectedRoute` con y sin `roles`); user común en `/admin` va a `/perfil` con aviso.

Commits:
- `feat(frontend): add movie form and my movies page`
- `feat(frontend): add admin movies crud`
- `feat(frontend): add admin page to change user roles`

## F9 — OAuth

- [ ] GitHub OAuth App local, probar el login, vinculación de cuentas y `email_not_found`.
- [ ] Google: proyecto en Google Cloud, pantalla de consentimiento (scopes básicos, **sin logo**), cliente OAuth web con redirect URIs local y prod, provider condicional. **Publicar la app** (In production). Respaldo: Testing + Gmail del profe como tester.

Commits:
- `feat(auth): add google social login`
- `fix(auth): ...` (lo que aparezca)

## F10 — Deploy

- [ ] Atlas: base de prod y `0.0.0.0/0`.
- [ ] Render backend → verificar `/api/auth/ok`.
- [ ] Render frontend + rewrites en orden.
- [ ] OAuth Apps de producción (GitHub + Google), actualizar `BETTER_AUTH_URL`.
- [ ] Seed en prod (`MONGODB_URI="<prod>" npm run seed`, la URI solo en la terminal) y login probado con los 2 usuarios de prueba.
- [ ] Opcional: keep-alive con UptimeRobot a `/health` cada 10 min.
- [ ] Recorrido completo en producción: F5 en `/admin` y `/peliculas/:id`, login con email, GitHub y Google, ABM, 403 con user común.

Commit: `chore: add render deploy notes` (si se agrega `render.yaml` o documentación).

## F11 — Cierre

- [ ] README final (ver `CLAUDE.md` §README).
- [ ] Auditoría de secretos en todo el historial: `git log -p | grep -iE "mongodb\+srv://[^<]|BETTER_AUTH_SECRET=.+|CLIENT_SECRET=.+"` tiene que dar vacío (o solo líneas vacías del `.env.example`).
- [ ] Checklist final contra `CONSIGNA.md`, punto por punto.

Commit: `docs: complete readme with endpoints, urls and test users`

---

| Fase | Estado |
|---|---|
| F0 | ✅ |
| F1 | ✅ |
| F2 | ✅ |
| F3 | ✅ |
| F4a (seed) | ✅ |
| F4b (dueño) | ✅ (pendiente de prueba y commit) |
| F5 | ✅ |
| F6 | ✅ |
| F7 | ✅ |
| F8 | ⬜ |
| F9 | ⬜ |
| F10 | ⬜ |
| F11 | ⬜ |
