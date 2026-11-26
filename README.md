# Cinema 24 — TP2 App de Películas

**Cinema 24** es una aplicación full stack (backend + frontend) con autenticación Better Auth, desplegada en Render. Trabajo práctico 2 de Programación Web Full Stack (UAI).

- Repositorio: <https://github.com/I-Carignano/TP2-Peliculas>
- **Frontend:** <https://tp2-peliculas.onrender.com>
- **API (backend):** <https://tp2-peliculas-api.onrender.com/api>

> **Aviso:** Render usa el plan gratuito. Si nadie usó la app en los últimos ~15 minutos, el backend está dormido y **la primera carga puede tardar ~50 segundos**. Después anda normal.

## 1. Descripción de la app y de la entidad

Catálogo de películas. Cualquier persona ve el listado (con búsqueda, filtros, orden y paginación) y el detalle de cada película. Quien se registra puede cargar sus propias películas; los administradores gestionan todas las películas y los usuarios.

**Entidad `Movie`**, expuesta como recurso `/api/peliculas` (el código está en inglés; la URL pública, en español y en plural):

| Campo | Tipo | Reglas |
|---|---|---|
| `title` | texto | obligatorio, hasta 150 caracteres |
| `director` | texto | obligatorio, hasta 100 caracteres |
| `genre` | texto (enum) | obligatorio: `accion`, `aventura`, `animacion`, `ciencia_ficcion`, `comedia`, `documental`, `drama`, `fantasia`, `romance`, `suspenso`, `terror` |
| `durationMinutes` | número | entero, 1 a 600 |
| `releaseDate` | fecha | `AAAA-MM-DD`, no más de 5 años a futuro |
| `rating` | número | 0 a 10, con un solo decimal |
| `available` | booleano | por defecto `true` |
| `synopsis` | texto | opcional, hasta 1000 caracteres |
| `posterUrl` | texto (URL) | opcional |
| `createdBy` | texto (id de usuario) | lo pone el servidor, no viene en el body |
| `createdAt` / `updatedAt` | fecha | automáticos |

En las respuestas de listado y detalle cada película incluye además `author: { id, username, name }` (no se guarda: se arma con una consulta a los usuarios).

## 2. Stack

| Capa | Tecnología |
|---|---|
| Backend | Node 22, Express 5, TypeScript 7, Mongoose 9, Zod 4 |
| Autenticación | Better Auth 1.7 (email y contraseña, GitHub, Google; plugins `admin` y `username`) |
| Base de datos | MongoDB Atlas (usuarios, sesiones y cuentas de Better Auth + películas) |
| Frontend | React 19, Vite 8, TypeScript 7, React Router 7, React Hook Form + Zod 4, Redux Toolkit (RTK Query) + axios, Tailwind CSS 4 |
| Deploy | Render: backend como Web Service y frontend como Static Site |

## 3. Usuarios de prueba (producción)

Creados con el seed. Entrar en <https://tp2-peliculas.onrender.com/login> con email y contraseña.

| Rol | Email | Contraseña |
|---|---|---|
| admin | admin@peliculas.com | `AdminProd2026` |
| user | user@peliculas.com | `UserProd2026` |
| superadmin | superadmin@peliculas.com | `SuperProd2026` |

También se puede entrar con **GitHub** o con **Google** (la app de Google está publicada, funciona con cualquier cuenta). Quien entra por GitHub o Google queda como `user`; la primera vez la app le pide completar su nombre de usuario.

## 4. Roles y permisos

Todo usuario nuevo es `user`. `admin` y `superadmin` los asigna el seed o un superadmin.

| | `user` | `admin` | `superadmin` |
|---|---|---|---|
| Ver catálogo y detalle | Sí (también sin sesión) | Sí | Sí |
| Crear películas (quedan a su nombre) | Sí | Sí | Sí |
| Editar / borrar películas | **Solo las suyas** | Todas | Todas |
| Ver la lista de usuarios (`/admin/usuarios`) | No | Sí, **sin** los superadmin | Sí, todos |
| Dar de baja, reactivar y eliminar usuarios | No | Solo usuarios con rol `user` | Todos, menos él mismo |
| Cambiar roles | No | **Solo ascender un `user` a `admin`**; después no puede tocarlo | Todos, menos él mismo |

### Desvíos respecto de la consigna

- **Rol `user` con escritura sobre lo suyo (aprobado por el docente).** La consigna dice que `user` solo puede leer y que las rutas de escritura van con `requireRole("admin")`. Se consultó al docente y aprobó que el `user` pueda **crear, editar y borrar sus propias películas** (el opcional "cada usuario edita solo lo suyo"); el `admin` sigue pudiendo con todas. Las rutas de escritura usan `authMiddleware` + `requireRole("user", "admin", "superadmin")` y el permiso fino (dueño o admin) se resuelve en el controller (`backend/src/lib/ownership.ts`).
- **Rol `superadmin` y reglas del admin sobre usuarios (agregado propio, no pedido por la consigna).** Se agregó un tercer rol y la regla de que un admin solo gestiona usuarios comunes (y solo puede ascender a un usuario a admin). **Se aplica en el backend**, no solo ocultando botones: 
  - el **control de acceso del plugin `admin`** de Better Auth (`backend/src/lib/permissions.ts`) define qué acciones puede cada rol: el admin puede listar, cambiar rol, dar de baja y eliminar; el `user` ninguna (403 aunque se llame con `curl`);
  - un **hook** (`backend/src/lib/user-management-guard.ts`) controla sobre *quién*: impide que un admin gestione a otros admin o superadmin (403), restringe el cambio de rol del admin a `user` → `admin` (cualquier otro rol nuevo, como `superadmin`, da 403) y evita que cualquiera se cambie su propio rol (400).

## 5. Endpoints de la API

Base: `https://tp2-peliculas-api.onrender.com/api` (desde el navegador se usa `/api` en el dominio del frontend). El **rol requerido** de la consigna está en la columna *Auth*.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/peliculas` | Pública (`mine=true` exige sesión) | Listado con paginación, filtros y orden. Responde `{ data, meta }` |
| QUERY | `/api/peliculas` | Pública (`mine: true` exige sesión) | Igual que el GET pero con los filtros en el body JSON |
| GET | `/api/peliculas/:id` | Pública | Detalle. 400 si el id está mal formado, 404 si no existe |
| POST | `/api/peliculas` | user, admin o superadmin | Crea una película (201). 400 por validación, 401 sin sesión |
| PUT | `/api/peliculas/:id` | user (solo las suyas), admin y superadmin | Reemplazo completo. 400, 401, 403, 404 |
| PATCH | `/api/peliculas/:id` | user (solo las suyas), admin y superadmin | Edición parcial. 400, 401, 403, 404 |
| DELETE | `/api/peliculas/:id` | user (solo las suyas), admin y superadmin | Elimina (204 sin body). 400, 401, 403, 404 |
| POST | `/api/perfil/contrasena` | Logueado (cualquier rol) | Agrega email y contraseña a una cuenta creada con GitHub/Google. Body `{ "newPassword": "..." }` (8 a 128 caracteres). 204; 400 si ya la tiene |
| GET | `/api/config` | Pública | `{ "googleEnabled": true }`: el frontend lo usa para mostrar el botón de Google |
| GET | `/health` | Pública | Estado del servidor (en el backend, fuera de `/api`) |
| * | `/api/auth/*` | Better Auth | Registro, login, logout, sesión, callbacks de GitHub y Google, y `admin/*` (`list-users`, `set-role`, `ban-user`, `unban-user`, `remove-user`) con los permisos de la sección 4 |

**Filtros del listado** (query params en el GET; los mismos como campos del body en el QUERY): `page` (1), `limit` (12, máx. 50), `search` (título o director), `genre`, `available`, `minRating`, `sortBy` (`createdAt`, `title`, `releaseDate`, `rating`, `durationMinutes`), `sortOrder` (`asc`/`desc`), `mine`.

**Formato de error unificado** (toda la API):

```json
{
  "success": false,
  "error": {
    "message": "Los datos enviados no son válidos",
    "details": { "title": ["El título es obligatorio"] }
  }
}
```

`details` aparece solo en los 400 de validación (Zod). Códigos: 400 datos inválidos, 401 sin sesión, 403 sin permisos (también "Solo podés modificar las películas que creaste"), 404 no existe, 500 error interno (el detalle va al log del servidor, nunca al cliente).

## 6. Funcionalidades extra

Opcionales de la consigna:

- **Paginación, filtros, búsqueda y orden** en el listado (`MoviesList`, `useMovieFilters`).
- **Cada usuario edita solo lo suyo** (`/mis-peliculas`, regla del dueño en el backend).
- **Login con Google**, además de GitHub.
- **Página de admin para cambiar roles** (`/admin/usuarios`, `admin.setRole` de Better Auth).

Agregados propios:

- **Marca Cinema 24:** logo, favicon, paleta propia (rojo `#C5162E`, tinta `#211B1C`, fondo rosa `#FBECEE`) con contraste revisado, encabezado del catálogo y footer.
- **Botones de Google y GitHub** con sus íconos oficiales (SVG inline) en login, registro y perfil.

- **Nombre de usuario** único (`@usuario`) y **completar perfil** obligatorio para quien entra con GitHub/Google.
- **Perfil editable** (usuario, nombre y apellido) con lápiz y modal.
- **Vincular cuentas** de GitHub y Google desde el perfil.
- **Agregar contraseña** a cuentas sociales (para poder entrar también con email).
- **Autor** visible en cada película (`@usuario` o nombre).
- **Modales** propios (sobre `<dialog>`) para crear/editar y para las confirmaciones.
- **Dar de baja, reactivar y eliminar** usuarios (con las reglas de la sección 4).
- Póster, sinopsis y botón para copiar el ID de la película (útil para probar la API).
- **Página de privacidad** (`/privacidad`).
- Método `QUERY` además del GET para el listado.

## 7. Correr en local

**Requisitos:** Node 22, una base de MongoDB (por ejemplo, un cluster gratuito de Atlas) y una OAuth App de GitHub.

### Variables de entorno (`backend/.env`, a partir de `backend/.env.example`)

| Variable | Qué es |
|---|---|
| `PORT` | Puerto del backend (3000) |
| `NODE_ENV` | `development` |
| `MONGODB_URI` | URI de MongoDB (con el nombre de la base) |
| `BETTER_AUTH_SECRET` | Secret de Better Auth (generar con `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`) |
| `BETTER_AUTH_URL` | URL del **frontend**: `http://localhost:5173` |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | OAuth App de GitHub (callback: `http://localhost:5173/api/auth/callback/github`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Opcionales. Si faltan, el login con Google se desactiva (callback: `http://localhost:5173/api/auth/callback/google`) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Usuario admin del seed |
| `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` | Usuario común del seed |
| `SEED_SUPERADMIN_EMAIL` / `SEED_SUPERADMIN_PASSWORD` | Superadmin del seed |

El frontend no tiene variables de entorno: llama siempre a `/api` y el proxy de Vite lo manda al backend (`vite.config.ts`).

### Comandos (Git Bash)

```bash
# 1) Backend
cd backend
cp .env.example .env      # completar los valores
npm install
npm run seed              # crea los usuarios de prueba y 31 películas de ejemplo (se puede repetir sin duplicar)
npm run dev               # http://localhost:3000

# 2) Frontend (otra terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173
```

Otros comandos: `npm run build` (back y front; genera `dist/`), `npm start` (backend compilado: `node dist/server.js`) y `npm run lint` (frontend).

## 8. Deploy en Render

Dos servicios sobre el mismo repo:

| Servicio | Tipo | Root Directory | Build | Start / Publish |
|---|---|---|---|---|
| Backend | Web Service | `backend` | `npm install --include=dev && npm run build` | `npm start` |
| Frontend | Static Site | `frontend` | `npm install --include=dev && npm run build` | Publish: `dist` |

Rewrites del Static Site, en este orden: `/api/*` → `https://tp2-peliculas-api.onrender.com/api/*` y `/*` → `/index.html` (así el frontend llama a `/api` sin CORS y F5 funciona en cualquier ruta). La guía completa (variables, callbacks de GitHub y Google, seed contra producción) está en **[docs/DEPLOY.md](docs/DEPLOY.md)**.

## 9. Decisiones y limitaciones conocidas

- **Sin verificación de email:** el registro con email y contraseña no confirma que el email exista. Tampoco hay "olvidé mi contraseña".
- **El email no se puede cambiar** desde la app (solo nombre de usuario, nombre y apellido).
- **Cuentas sociales sin username:** quien entra con GitHub/Google tiene que elegir uno antes de usar la app (`/completar-perfil`). Los usuarios con cuentas viejas sin username se muestran por su nombre.
- **Usuario eliminado:** sus películas quedan en el catálogo y el autor se muestra como "—".
- **Plan gratuito de Render:** el backend se duerme tras ~15 minutos sin tráfico y la primera request tarda ~50 s.
- **Pósters:** son enlaces a imágenes externas (TMDB y Wikimedia); si el sitio de origen cambia o bloquea, el póster no carga y se muestra un placeholder con el género.
- **El frontend edita con PUT** (objeto completo, así se puede borrar un póster o una sinopsis); PATCH está disponible en la API.
- **Sin tests automatizados:** la verificación fue manual y con `npm run build` / `npm run lint`.
- **Verificado a mano contra producción:** el rewrite `/api/*`, el fallback de la SPA y el método `QUERY` a través de Render.

## 10. Documentación del proyecto

- [`docs/CONSIGNA_FINAL.md`](docs/CONSIGNA_FINAL.md): la consigna del TP Final y los acuerdos con el docente.
- [`docs/PLAN_FINAL.md`](docs/PLAN_FINAL.md): fases, ramas y PRs del TP Final.
- [`docs/SPEC.md`](docs/SPEC.md): decisiones técnicas vigentes (entidad, endpoints, errores, rutas del frontend).
- [`docs/DISENO.md`](docs/DISENO.md): paleta, componentes y pantallas.
- [`docs/DEPLOY.md`](docs/DEPLOY.md): configuración de Render.
- Historia del TP2 en [`docs/tp2/`](docs/tp2/): [`CONSIGNA.md`](docs/tp2/CONSIGNA.md), [`PLAN.md`](docs/tp2/PLAN.md) y [`CHECKLIST.md`](docs/tp2/CHECKLIST.md).

## 11. Metodología de trabajo

> El historial anterior a este PR corresponde al TP2 (commits directos a `main`, aprobado por el docente). Desde F0, todo cambio entra por Pull Request con descripción.

- Una rama por PR (`feat/…`, `fix/…`, `chore/…`, `docs/…`), commits chicos y convencionales, y PR a `main` con la plantilla de [`.github/pull_request_template.md`](.github/pull_request_template.md): qué se agregó, cómo verificarlo y qué requisitos de la consigna cubre.
- Merge con merge commit, para preservar el historial granular.
- Fases y PRs: [`docs/PLAN_FINAL.md`](docs/PLAN_FINAL.md). Consigna: [`docs/CONSIGNA_FINAL.md`](docs/CONSIGNA_FINAL.md).

El README completo del TP Final se rehace en F12.
