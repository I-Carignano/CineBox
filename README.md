# Cinema 24

**Cinema 24** es una aplicación web full stack para descubrir, calificar y organizar películas y series. Cualquier persona puede explorar el catálogo sin cuenta; quien se registra tiene su perfil y, a medida que avance el proyecto, va a poder marcar lo que vio, calificar y reseñar, armar listas y recibir recomendaciones. El catálogo lo administran los administradores.

Trabajo Práctico Final de **Metodologías y Desarrollos Web** (UAI, 2026).

> **Estado:** borrador del TP Final (fase F1 de [`docs/PLAN_FINAL.md`](docs/PLAN_FINAL.md)). Hoy la app tiene el catálogo de películas heredado del TP2; los otros dos modelos se suman en F4 y F5. Este README se completa en F12.

| | URL |
|---|---|
| Frontend | <https://tp2-peliculas.onrender.com> |
| API | <https://tp2-peliculas-api.onrender.com/api> |
| Repositorio | <https://github.com/I-Carignano/TP2-Peliculas> |

> **Aviso:** Render usa el plan gratuito. Si nadie usó la app en los últimos ~15 minutos, el backend está dormido y **la primera carga puede tardar ~50 segundos**.

## 1. Integrante y modelos

Trabajo **individual** (aprobado por el docente con la condición de cubrir tres modelos).

| Integrante | Modelos a cargo |
|---|---|
| **Ignacio Carignano** | Títulos, Calificaciones y Listas (backend y frontend de los tres) |

Los usuarios, sesiones y cuentas de Better Auth no cuentan como modelos propios.

### 1.1 Títulos (`/api/titulos`, hoy `/api/peliculas`)

Hoy es el modelo **`Movie`** del TP2, expuesto en `/api/peliculas`. En **F3** evoluciona a **`Title`** (películas y series, con datos de TMDB) y pasa a `/api/titulos`. Campos actuales:

| Campo | Tipo | Reglas |
|---|---|---|
| `title` | texto | obligatorio, hasta 150 caracteres |
| `director` | texto | obligatorio, hasta 100 caracteres |
| `genre` | texto (enum) | obligatorio: `accion`, `aventura`, `animacion`, `ciencia_ficcion`, `comedia`, `documental`, `drama`, `fantasia`, `romance`, `suspenso`, `terror` |
| `durationMinutes` | número | entero, de 1 a 600 |
| `releaseDate` | fecha | `AAAA-MM-DD`, no más de 5 años a futuro |
| `rating` | número | de 0 a 10, con un solo decimal |
| `available` | booleano | por defecto `true` |
| `synopsis` | texto | opcional, hasta 1000 caracteres |
| `posterUrl` | texto (URL) | opcional |
| `createdBy` | texto (id de usuario) | lo pone el servidor: quién la cargó (no da permisos) |
| `active` | booleano | por defecto `true`; `false` = dada de baja (baja lógica) |
| `deletedAt` | fecha o vacío | fecha de la baja lógica |
| `createdAt` / `updatedAt` | fecha | automáticos |

### 1.2 Calificaciones (`/api/calificaciones`, F4)

Lo que cada usuario hace con un título: `userId` (texto), `titleId` (referencia a Título), `season` (número o vacío), `score` (número, de 0,5 a 5), `watched`, `liked` y `watchlist` (booleanos), `review` (texto), `hasSpoilers` (booleano) y `watchedAt` (fecha). Cada usuario gestiona solo las suyas.

### 1.3 Listas (`/api/listas`, F5)

Listas de títulos armadas por los usuarios: `ownerId` (texto), `name` y `description` (texto), `isPublic` (booleano) e `items` (títulos con nota y fecha en que se agregaron). Cada usuario gestiona solo las suyas.

Los tres modelos tienen **baja lógica** (`active` + `deletedAt`: se oculta de lo público y se puede restaurar) y **baja física** (eliminación definitiva). En Títulos ya está hecha (F1); Calificaciones y Listas la suman en F4 y F5.

## 2. Stack y arquitectura

| Capa | Tecnología |
|---|---|
| Backend | Node 22, Express 5, TypeScript, Mongoose 9, Zod 4 |
| Autenticación | Better Auth 1.7: email y contraseña, GitHub y Google; plugins `admin` y `username` |
| Base de datos | MongoDB Atlas |
| Frontend | React 19, Vite 8, TypeScript, React Router 7, React Hook Form + Zod 4, Redux Toolkit (RTK Query) + axios, Tailwind CSS 4 |
| Deploy | Render: backend como Web Service y frontend como Static Site |

**Monorepo** con dos carpetas: `backend/` (API REST) y `frontend/` (SPA).

```
Navegador ──▶ Frontend (Static Site) ──rewrite /api/*──▶ API Express ──▶ MongoDB Atlas
              React + RTK Query                          Better Auth (usuarios y sesiones)
```

El frontend llama siempre a `/api` en su mismo dominio: en local lo redirige el proxy de Vite y en producción, el rewrite de Render. Por eso no hace falta CORS y la cookie de sesión es del mismo origen. Más adelante se suman TMDB (catálogo, F3), Cloudflare R2 (imágenes, F7) y un agente LLM con Groq (F8), siempre desde el backend.

**Capas del backend**, como en el repositorio de la materia:

```
routes ─▶ middlewares ─▶ controllers ─▶ services ─▶ models (Mongoose) ─▶ MongoDB
          authMiddleware (401)          lógica de    esquemas y
          requireRole (403)             negocio      validación
          validateBody / validateQuery (Zod, 400)
```

- **routes:** asocian método y ruta con sus middlewares y su controller.
- **middlewares:** sesión (`authMiddleware`), rol (`requireRole`) y validación con Zod. Los errores responden con un formato único: `{ success: false, error: { message, details? } }`.
- **controllers:** capa HTTP; leen la request, llaman al service y responden con el código que corresponde (201, 204, 400, 401, 403, 404).
- **services:** filtros, paginación y acceso a la base, sin saber nada de HTTP.
- **models:** esquemas de Mongoose.

## 3. Ejecución local

### Requisitos previos

- **Node.js 22** y npm.
- Una base **MongoDB** (por ejemplo, un cluster gratuito de MongoDB Atlas).
- Una **OAuth App de GitHub** para el login con GitHub. Google es opcional.
- **Git Bash** u otra terminal compatible con bash (los comandos están escritos para Git Bash en Windows).

### Instalación y ejecución

Se usan **dos terminales**, una para cada carpeta.

```bash
# Terminal 1: backend
cd backend
cp .env.example .env      # completar los valores (ver la tabla de abajo)
npm install
npm run seed              # usuarios de prueba y películas de ejemplo; se puede repetir sin duplicar
npm run dev               # API en http://localhost:3000

# Terminal 2: frontend
cd frontend
npm install
npm run dev               # app en http://localhost:5173
```

Abrir <http://localhost:5173>. Otros comandos: `npm run build` (backend y frontend), `npm start` (backend compilado) y `npm run lint` (frontend).

### Variables de entorno

Van en `backend/.env`, a partir de `backend/.env.example`. El archivo `.env` **nunca** se versiona. El frontend no usa variables de entorno.

| Variable | Para qué | Dónde se obtiene |
|---|---|---|
| `PORT` | Puerto del backend | Local: `3000`. En Render lo asigna la plataforma |
| `NODE_ENV` | Modo de ejecución; Better Auth lo lee (en `production` activa el límite de pedidos y exige un secret propio) | `development` en local y `production` en Render |
| `MONGODB_URI` | Conexión a la base, con el nombre de la base | MongoDB Atlas → *Connect* → *Drivers* |
| `BETTER_AUTH_SECRET` | Firma de las sesiones | Generarlo con `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`; uno distinto por entorno |
| `BETTER_AUTH_URL` | URL pública del **frontend** (base de las cookies y de los callbacks de OAuth) | Local: `http://localhost:5173`. En producción, la URL del Static Site |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Login con GitHub | GitHub → *Settings* → *Developer settings* → *OAuth Apps*. Callback: `<BETTER_AUTH_URL>/api/auth/callback/github` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login con Google (opcional: si faltan, el botón no aparece) | Google Cloud Console → *APIs y servicios* → *Credenciales* → ID de cliente OAuth. Callback: `<BETTER_AUTH_URL>/api/auth/callback/google` |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Usuario admin que crea `npm run seed` | Los elegís vos |
| `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` | Usuario común que crea el seed | Los elegís vos |
| `SEED_SUPERADMIN_EMAIL` / `SEED_SUPERADMIN_PASSWORD` | Superadmin que crea el seed | Los elegís vos |

## 4. Usuarios de prueba (producción)

Creados con el seed. Se ingresa en <https://tp2-peliculas.onrender.com/login>.

| Rol | Email | Contraseña |
|---|---|---|
| admin | admin@peliculas.com | `AdminProd2026` |
| user | user@peliculas.com | `UserProd2026` |
| superadmin | superadmin@peliculas.com | `SuperProd2026` |

También se puede entrar con **GitHub** o **Google**. Quien entra así queda como `user` y la primera vez elige su nombre de usuario.

## 5. Roles y permisos

Todo usuario nuevo recibe el rol `user`. Los roles `admin` y `superadmin` los asigna el seed o un superadmin; un admin puede ascender un `user` a `admin`.

| | `user` | `admin` | `superadmin` |
|---|---|---|---|
| Ver el catálogo y el detalle | Sí (también sin sesión) | Sí | Sí |
| Crear, editar y borrar películas | **No (403)** | Sí, todas | Sí, todas |
| Panel de administración (`/admin`) | No (vuelve al perfil con "No tenés permisos") | Sí | Sí |
| Ver usuarios (`/admin/usuarios`) | No | Sí, sin los superadmin | Sí, todos |
| Dar de baja, reactivar y eliminar usuarios | No | Solo usuarios `user` | Todos, menos él mismo |
| Cambiar roles | No | Solo `user` → `admin` | Todos, menos él mismo |

Los permisos se aplican **en el backend** (`requireRole`, el control de acceso del plugin `admin` en `backend/src/lib/permissions.ts` y el hook `backend/src/lib/user-management-guard.ts`); el frontend solo oculta lo que el rol no puede usar.

**Acuerdos con el docente:** trabajo individual con tres modelos; catálogo solo del admin, y cada `user` escribe solo sus calificaciones y listas (F4 y F5); corte de metodología en F0 (sección 9).

## 6. Endpoints actuales

Base: `/api`. Respuestas de error con el formato `{ success: false, error: { message, details? } }`.

| Método | Ruta | Rol | Respuestas |
|---|---|---|---|
| GET | `/api/peliculas` | Público | 200 `{ data, meta }` con las películas **activas**, paginación, filtros y orden; 400 si la query es inválida |
| QUERY | `/api/peliculas` | Público | Igual que el GET, con los filtros en el body JSON |
| GET | `/api/peliculas/:id` | Público | 200; 400 id mal formado; 404 no existe o está dada de baja (el admin sí la ve) |
| POST | `/api/peliculas` | admin, superadmin | 201; 400 validación; 401 sin sesión; 403 `user` |
| PUT / PATCH | `/api/peliculas/:id` | admin, superadmin | 200; 400; 401; 403; 404 |
| DELETE | `/api/peliculas/:id` | admin, superadmin | **Baja lógica:** 200 con la película inactiva; 400; 401; 403; 404 |
| DELETE | `/api/peliculas/:id?permanente=true` | admin, superadmin | **Baja física:** 204; 400; 401; 403; 404 |
| PATCH | `/api/peliculas/:id/restaurar` | admin, superadmin | 200 con la película activa de nuevo; 400; 401; 403; 404 |
| POST | `/api/perfil/contrasena` | Logueado | 204: agrega email y contraseña a una cuenta de GitHub o Google |
| GET | `/api/config` | Público | `{ googleEnabled }` |
| GET | `/health` | Público | Estado del servidor (fuera de `/api`) |
| * | `/api/auth/*` | Better Auth | Registro, login, logout, sesión, OAuth y `admin/*` |

Filtros del listado: `page`, `limit` (máximo 50), `search` (título o director), `genre`, `available`, `minRating`, `sortBy` y `sortOrder`. Solo para admin: `estado` (`activas`, `inactivas` o `todas`; para cualquier otro rol se ignora).

## 7. Funcionalidades

- **Opcionales de la consigna ya implementados:** login con Google (y GitHub), paginación en backend y frontend, y panel de usuarios con cambio de roles (`/admin/usuarios`).
- **Autenticación:** registro y login con validaciones y mensajes de error visibles; logout con vuelta al inicio; las rutas privadas sin sesión redirigen al login y, después de entrar, vuelven a donde se iba.
- **Perfil:** nombre de usuario único, nombre y apellido editables, cuentas de GitHub y Google vinculables, y contraseña agregable a una cuenta social.
- **Panel de administración** (`/admin`): ABM de películas con pestañas **Activas / Inactivas**. En Activas, "Editar" y "Dar de baja" (baja lógica); en Inactivas, "Restaurar" y "Eliminar definitivamente" (baja física). Cada baja tiene su propio modal de confirmación con Cancelar y Confirmar. Los cambios se reflejan solos en el catálogo público: una película dada de baja desaparece y su dirección muestra el 404 de la app.
- Método `QUERY` además del GET para el listado, y página de privacidad (`/privacidad`).

## 8. Deploy

Dos servicios de Render sobre este repositorio: el backend como **Web Service** (`backend/`) y el frontend como **Static Site** (`frontend/`, con rewrites `/api/*` → API y `/*` → `index.html`). La guía completa está en [`docs/DEPLOY.md`](docs/DEPLOY.md).

## 9. Metodología de trabajo

> El historial anterior a este PR corresponde al TP2 (commits directos a `main`, aprobado por el docente). Desde F0, todo cambio entra por Pull Request con descripción.

- Una rama por PR (`feat/…`, `fix/…`, `chore/…`, `docs/…`), commits chicos y convencionales, y PR a `main` con la plantilla de [`.github/pull_request_template.md`](.github/pull_request_template.md): qué se agregó, cómo verificarlo y qué requisitos de la consigna cubre.
- Merge con merge commit, para preservar el historial granular.
- Fases y PRs: [`docs/PLAN_FINAL.md`](docs/PLAN_FINAL.md). Consigna: [`docs/CONSIGNA_FINAL.md`](docs/CONSIGNA_FINAL.md).

## 10. Documentación del proyecto

- [`docs/CONSIGNA_FINAL.md`](docs/CONSIGNA_FINAL.md): consigna del TP Final y acuerdos con el docente.
- [`docs/PLAN_FINAL.md`](docs/PLAN_FINAL.md): fases, ramas y PRs.
- [`docs/DECISIONES.md`](docs/DECISIONES.md): registro de decisiones.
- [`docs/SPEC.md`](docs/SPEC.md): decisiones técnicas vigentes (modelos, endpoints, errores y rutas del frontend).
- [`docs/DISENO.md`](docs/DISENO.md): paleta, componentes y pantallas.
- [`docs/DEPLOY.md`](docs/DEPLOY.md): configuración de Render.
- Historia del TP2 en [`docs/tp2/`](docs/tp2/).
