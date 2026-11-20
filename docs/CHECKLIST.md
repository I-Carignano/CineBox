# CHECKLIST — Requisitos de la consigna

Cada requisito de [`CONSIGNA.md`](CONSIGNA.md) con su estado y dónde se cumple. Estados: **Cumplido**, **Parcial**, **No**.

Los puntos marcados con **(mín.)** son requisitos mínimos; los demás son opcionales o de entrega.

> Todos los requisitos están cumplidos. Al final quedan dos verificaciones manuales opcionales.

## 1. Repositorio

| # | Requisito | Estado | Dónde |
|---|---|---|---|
| R1 (mín.) | Repo en GitHub con estructura `backend/` + `frontend/` | Cumplido | <https://github.com/I-Carignano/TP2-Peliculas>; carpetas [`backend/`](../backend) y [`frontend/`](../frontend) |
| R2 (mín.) | README en la raíz: descripción de la app y de la entidad | Cumplido | [README.md](../README.md) §1 |
| R3 (mín.) | README: URL del frontend y del backend en Render | Cumplido | README.md, encabezado |
| R4 (mín.) | README: cómo correrlo en local (comandos y variables de entorno) | Cumplido | README.md §7 |
| R5 (mín.) | README: tabla de endpoints (método, ruta, rol requerido) | Cumplido | README.md §5 |
| R6 (mín.) | README: dos usuarios de prueba (admin y user) con email y contraseña | Cumplido | README.md §3: admin, user y superadmin con email y contraseña |
| R7 (mín.) | `.env.example` en `backend/` con todas las variables, sin valores reales | Cumplido | [backend/.env.example](../backend/.env.example) (solo trae `PORT`, `NODE_ENV` y `BETTER_AUTH_URL=http://localhost:5173`; el resto vacío) |
| R8 (mín.) | Ningún secreto commiteado (`.env`, `BETTER_AUTH_SECRET`, secret de GitHub, URI de Mongo), tampoco en el historial | Cumplido | Auditoría de todo el historial (ver informe de F11): sin hallazgos. `.gitignore` cubre `.env` |
| R9 (mín.) | Commits chicos y descriptivos (`feat:`, `fix:`, `docs:`...) | Cumplido | 30 commits convencionales (`git log --oneline`) |

## 2. Backend

| # | Requisito | Estado | Dónde |
|---|---|---|---|
| B1 (mín.) | Entidad propia con ≥ 4 campos y ≥ 3 tipos | Cumplido | [models/Movie.ts](../backend/src/models/Movie.ts): texto, número, fecha, booleano y enum (10 campos) |
| B2 (mín.) | CRUD REST sobre un recurso en plural (`/api/<recurso>`) | Cumplido | `/api/peliculas`: [routes/movies.routes.ts](../backend/src/routes/movies.routes.ts) |
| B3 (mín.) | GET lista, GET por id, POST, PUT/PATCH, DELETE | Cumplido | movies.routes.ts (PUT **y** PATCH, más QUERY como extra) |
| B4 (mín.) | Validación con Zod en crear y editar, con 400 claros | Cumplido | [schemas/movie.schema.ts](../backend/src/schemas/movie.schema.ts), [middlewares/validate.ts](../backend/src/middlewares/validate.ts) |
| B5 (mín.) | 201 al crear | Cumplido | [controllers/movies.controller.ts](../backend/src/controllers/movies.controller.ts) (`createMovie`) |
| B6 (mín.) | 404 si no existe | Cumplido | movies.controller.ts (get, put, patch, delete) |
| B7 (mín.) | 401 sin sesión | Cumplido | [middlewares/auth.middleware.ts](../backend/src/middlewares/auth.middleware.ts) (`authMiddleware`) |
| B8 (mín.) | 403 sin permisos | Cumplido | `requireRole` y [lib/ownership.ts](../backend/src/lib/ownership.ts) |
| B9 (mín.) | Better Auth con email/contraseña y GitHub, usuarios y sesiones en Mongo | Cumplido | [lib/auth.ts](../backend/src/lib/auth.ts) (`mongodbAdapter`, `emailAndPassword`, `socialProviders.github`) |
| B10 (mín.) | Dos roles: `user` por defecto y `admin` | **Cumplido con desvíos** | Rol `user` por defecto y `admin` existen (plugin `admin` en lib/auth.ts). Desvíos: `user` también escribe sobre lo suyo (aprobado por el docente) y se agregó `superadmin`. Ver README §4 |
| B11 (mín.) | Escritura con `authMiddleware` + `requireRole("admin")`; lectura pública | **Cumplido con desvío** | movies.routes.ts: `canWrite = [authMiddleware, requireRole("user","admin","superadmin")]`; el permiso fino (dueño o admin) está en el controller. **Desvío aprobado por el docente (P03: "Sí")**. Lectura pública |

## 3. Frontend

| # | Requisito | Estado | Dónde |
|---|---|---|---|
| F1 (mín.) | Listado de la entidad | Cumplido | [pages/MoviesList.tsx](../frontend/src/pages/MoviesList.tsx) |
| F2 (mín.) | Detalle de la entidad | Cumplido | [pages/MovieDetail.tsx](../frontend/src/pages/MovieDetail.tsx) |
| F3 (mín.) | Login (email y GitHub) | Cumplido | [pages/Login.tsx](../frontend/src/pages/Login.tsx) |
| F4 (mín.) | Registro | Cumplido | [pages/Register.tsx](../frontend/src/pages/Register.tsx) |
| F5 (mín.) | Logout | Cumplido | [layouts/Layout.tsx](../frontend/src/layouts/Layout.tsx) (`handleLogout`) |
| F6 (mín.) | Panel de admin con ABM, en ruta protegida por rol; un user común no entra (redirige o "sin permisos") | Cumplido | [pages/AdminMovies.tsx](../frontend/src/pages/AdminMovies.tsx) en `/admin`; [router/ProtectedRoute.tsx](../frontend/src/router/ProtectedRoute.tsx) redirige al `user` a `/perfil` con "No tenés permisos" ([router/index.tsx](../frontend/src/router/index.tsx)) |
| F7 (mín.) | Formularios con React Hook Form + Zod mostrando errores | Cumplido | [components/MovieForm.tsx](../frontend/src/components/MovieForm.tsx), Login, Register, perfil; schemas en [src/schemas/](../frontend/src/schemas) |
| F8 (mín.) | Sesión con `useSession()`; al recargar se mantiene | Cumplido | [lib/auth-client.ts](../frontend/src/lib/auth-client.ts); la sesión es una cookie que Better Auth lee del backend |

## 4. Deploy (Render)

| # | Requisito | Estado | Dónde |
|---|---|---|---|
| D1 (mín.) | Backend como Web Service y frontend como Static Site | Cumplido | <https://tp2-peliculas-api.onrender.com/health> y <https://tp2-peliculas.onrender.com>; config en [DEPLOY.md](DEPLOY.md) |
| D2 (mín.) | El frontend llama a la API por `/api` (rewrite `/api/*` → backend), no directo | Cumplido | [lib/api.ts](../frontend/src/lib/api.ts) (`baseURL: "/api"`), cliente de Better Auth sin `baseURL`; rewrite verificado: `GET https://tp2-peliculas.onrender.com/api/peliculas` responde el catálogo |
| D3 (mín.) | F5 en cualquier ruta funciona (rewrite `/*` → `/index.html`) | Cumplido | Verificado: `/peliculas` y `/privacidad` responden 200 recargando en frontend |
| D4 (mín.) | Login con GitHub funcionando en producción (OAuth App de producción con su callback) | Cumplido | Callback `https://tp2-peliculas.onrender.com/api/auth/callback/github` (ver [DEPLOY.md](DEPLOY.md) §3). Login con GitHub probado en producción |

## 5. Opcionales

| # | Requisito | Estado | Dónde |
|---|---|---|---|
| O1 | Paginación, filtros o búsqueda en el listado | Cumplido | [services/movies.service.ts](../backend/src/services/movies.service.ts) (búsqueda, género, disponibilidad, rating mínimo, orden, paginación); UI en [components/MovieFilters.tsx](../frontend/src/components/MovieFilters.tsx) y [components/Pagination.tsx](../frontend/src/components/Pagination.tsx) |
| O2 | Cada usuario ve / edita solo sus propios registros | Cumplido | [lib/ownership.ts](../backend/src/lib/ownership.ts); `mine=true` en el listado; [pages/MyMovies.tsx](../frontend/src/pages/MyMovies.tsx) |
| O3 | Login con Google además de GitHub | Cumplido | `socialProviders.google` en lib/auth.ts (condicional a `GOOGLE_*`); botón en Login.tsx. `GET /api/config` en producción responde `googleEnabled: true`. Login con Google probado en producción |
| O4 | Página de admin para cambiar roles (`authClient.admin.setRole`) | Cumplido | [pages/AdminUsers.tsx](../frontend/src/pages/AdminUsers.tsx) en `/admin/usuarios` (solo superadmin cambia roles; ver README §4) |

## 6. Entrega obligatoria

| # | Requisito | Estado | Dónde |
|---|---|---|---|
| E1 | Link al repositorio | Cumplido | <https://github.com/I-Carignano/TP2-Peliculas> |
| E2 | URL del frontend desplegado | Cumplido | <https://tp2-peliculas.onrender.com> |
| E3 | README explicando el proyecto | Cumplido | [README.md](../README.md) |
| E4 | Usuarios de prueba con su contraseña (admin y user) | Cumplido | README.md §3 |

## 7. Verificaciones manuales que quedan (opcionales)

1. **Roles en producción**: entrar como `admin` y como `user` y comprobar que el `user` no entra a `/admin` y que el admin ve `/admin` y `/admin/usuarios`.
2. **Película de prueba suelta en producción**: el catálogo de producción tiene una película cargada a mano (título "h") cuyo autor ya no existe. Borrarla desde `/admin` si no se quiere en la entrega.
