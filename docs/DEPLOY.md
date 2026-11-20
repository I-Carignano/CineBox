# DEPLOY.md — Cómo publicar la app en Render

Dos servicios de Render conectados al mismo repo de GitHub (`I-Carignano/TP2-Peliculas`):

| Servicio | Tipo | Carpeta (Root Directory) | Qué sirve |
| --- | --- | --- | --- |
| `tp2-peliculas-api` (nombre a elección) | **Web Service** | `backend` | API Express + Better Auth |
| `tp2-peliculas-web` (nombre a elección) | **Static Site** | `frontend` | React (build de Vite) |

La idea: el navegador **solo habla con el front** (`https://<front>.onrender.com`). Las llamadas a `/api/*` las reenvía el Static Site al back con un *rewrite*, así la cookie de sesión es de un solo origen y no hace falta CORS (igual que el proxy de Vite en local).

> No se escribe ningún valor real (URIs, secrets) en el repo. Los valores se cargan a mano en el panel de Render (Environment) o en la terminal.

## 0. Antes de empezar

1. **MongoDB Atlas** (base de producción, distinta de la de desarrollo):
   - Crear un cluster (el gratuito alcanza) y un usuario de base de datos.
   - *Network Access*: agregar `0.0.0.0/0` (Render no tiene IP fija en el plan gratuito).
   - La URI tiene que llevar **el nombre de la base** en la ruta (`.../peliculas?...`); si no, Mongoose usa la base `test`.
2. **Secret nuevo** para producción (no reusar el de local):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
3. El código tiene que estar pusheado a GitHub (Render hace el deploy desde ahí).

## 1. Backend: Web Service

En Render: *New → Web Service → repo → Language: Node*.

| Campo | Valor |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/health` |
| Instance Type | Free |

Por qué `--include=dev`: Render instala con `NODE_ENV=production` y `npm install` se saltearía `typescript` y los `@types/*`, que hacen falta para compilar. `npm run build` genera `dist/` y `npm start` corre `node dist/server.js`.

El server escucha en `process.env.PORT` (Render lo inyecta; en local cae en 3000). Node: `engines.node` es `>=22`; además se fija con la variable `NODE_VERSION` (abajo).

### Variables de entorno del backend (Environment)

Los valores se completan en el panel; acá solo van los nombres.

| Variable | Qué es |
| --- | --- |
| `NODE_VERSION` | `22` |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | URI de Atlas de producción (con el nombre de la base) |
| `BETTER_AUTH_SECRET` | El secret nuevo generado en el paso 0 |
| `BETTER_AUTH_URL` | URL pública del **front**: `https://<front>.onrender.com` (sin `/` al final) |
| `GITHUB_CLIENT_ID` | De la OAuth App de GitHub **de producción** |
| `GITHUB_CLIENT_SECRET` | Ídem |
| `GOOGLE_CLIENT_ID` | De la credencial de Google (opcional: sin esta y la siguiente, el botón de Google no aparece) |
| `GOOGLE_CLIENT_SECRET` | Ídem |

`PORT` no se carga: lo pone Render. Las `SEED_*` **no** van en Render: el seed se corre desde tu máquina (sección 4).

### Qué pasa con Better Auth detrás del rewrite

- `BETTER_AUTH_URL` es la URL del **front**, no la del back. Better Auth arma con ella los links de los callbacks OAuth.
- `trustedOrigins` (en `backend/src/lib/auth.ts`) incluye el origen de esa URL: el navegador manda `Origin: https://<front>.onrender.com` en los POST y Better Auth lo compara contra esa lista (protección CSRF).
- Cookies seguras: `advanced.useSecureCookies` se activa solo si `BETTER_AUTH_URL` empieza con `https://` (producción sí, local `http://localhost:5173` no).
- `app.set("trust proxy", 1)` **no hace falta**: el código no usa `req.ip` ni `req.secure`, y la URL pública sale de `BETTER_AUTH_URL`, no del `Host` que llega al back.

## 2. Frontend: Static Site

En Render: *New → Static Site → mismo repo*.

| Campo | Valor |
| --- | --- |
| Root Directory | `frontend` |
| Build Command | `npm install --include=dev && npm run build` |
| Publish Directory | `dist` |

Sin variables de entorno: el front llama siempre a `/api` relativo (axios `baseURL: "/api"` y el cliente de Better Auth sin `baseURL`).

### Rewrites (pestaña *Redirects/Rewrites*) — el orden importa

Render aplica la **primera** regla que coincide, por eso van en este orden:

| # | Source | Destination | Action |
| --- | --- | --- | --- |
| 1 | `/api/*` | `https://<back>.onrender.com/api/*` | **Rewrite** |
| 2 | `/*` | `/index.html` | **Rewrite** |

- La 1 manda la API al Web Service (tiene que ser *Rewrite*, no *Redirect*: el navegador sigue en el dominio del front y la cookie queda ahí).
- La 2 es el fallback de la SPA: sin ella, recargar `/peliculas/123` o `/login` da 404.
- `<back>` es el nombre del Web Service (la URL aparece arriba en su página).

### Orden sugerido para crearlos

El front necesita la URL del back y el back necesita la URL del front: crear el back, copiar su URL, crear el front con los rewrites, y volver al back a cargar `BETTER_AUTH_URL` con la URL del front (el servicio se redeploya solo al guardar la variable).

## 3. Callbacks de OAuth para producción

Como `/api` pasa por el front, los callbacks usan el **dominio del front**.

**GitHub** (*Settings → Developer settings → OAuth Apps → New OAuth App*; usar una App distinta a la de local):

- Homepage URL: `https://<front>.onrender.com`
- Authorization callback URL: `https://<front>.onrender.com/api/auth/callback/github`

**Google** (Google Cloud Console → *APIs y servicios → Credenciales → ID de cliente de OAuth, tipo Aplicación web*):

- Orígenes de JavaScript autorizados: `https://<front>.onrender.com`
- URI de redirección autorizados: `https://<front>.onrender.com/api/auth/callback/google`

Para local (`http://localhost:5173`) los equivalentes son `http://localhost:5173/api/auth/callback/github` y `.../google`; conviene tener ambos en el mismo cliente de Google (se pueden cargar varias URIs).

## 4. Seed contra la base de producción

Se corre **desde tu máquina**, no en Render. El seed usa `dotenv/config`, que **no pisa** variables que ya existen en el entorno: pasando las variables en la misma línea ganan sobre el `.env`, sin tocarlo. El resto de las variables que pide `lib/auth.ts` (`BETTER_AUTH_URL`, `GITHUB_*`, etc.) salen de tu `.env` local, no hace falta cambiarlas.

```bash
cd ~/source/"Repos VS code"/"TP2 - Peliculas - MYDW"/tp2-peliculas/backend
MONGODB_URI="<uri de atlas de produccion>" \
SEED_SUPERADMIN_EMAIL="<email superadmin>" SEED_SUPERADMIN_PASSWORD="<contraseña>" \
SEED_ADMIN_EMAIL="<email admin>" SEED_ADMIN_PASSWORD="<contraseña>" \
SEED_USER_EMAIL="<email user>" SEED_USER_PASSWORD="<contraseña>" \
npm run seed
```

- Reemplazá los `<...>` en la terminal; **no** los guardes en ningún archivo del repo.
- Verificá en la salida la línea `[seed] base de datos: <nombre>`: tiene que ser la de producción y no la de desarrollo.
- Para que no quede la URI en el historial de Git Bash, podés anteponer un espacio al comando (según la config de `HISTCONTROL`) o borrar la línea después.
- Se puede correr más de una vez: a los usuarios existentes les actualiza datos y rol, las películas se cargan solo si la colección está vacía y los pósters se sincronizan por título.
- Los emails y contraseñas de prueba que elijas acá son los que van al README (sección "Usuarios de prueba"). Usá contraseñas de prueba, no reales: van a figurar en el README.

## 5. Checklist de verificación

1. `https://<back>.onrender.com/health` responde `{"status":"ok",...}`.
2. `https://<front>.onrender.com/api/peliculas` devuelve el JSON del catálogo (confirma que el rewrite llega al back).
3. Recargar `https://<front>.onrender.com/peliculas` no da 404 (fallback de la SPA).
4. Login con email y contraseña de los usuarios del seed: el navegador guarda la cookie de sesión (DevTools → Application → Cookies, dominio del front, con `Secure` y `HttpOnly`).
5. Login con GitHub (y con Google si está configurado) y completar el perfil.
6. Crear, editar y borrar una película; entrar como admin y como superadmin a `/admin` y `/admin/usuarios`.
7. Probar el método `QUERY` (`/api/peliculas`) a través de Render; si algún proxy lo bloqueara, anotarlo en el README (el front usa GET).
8. `https://<front>.onrender.com/privacidad` carga sin sesión.

## 6. Cosas a tener en cuenta

- **Plan gratuito**: el Web Service se duerme tras ~15 min sin tráfico y la primera request tarda ~50 s en despertar. Antes de la entrega, abrir el sitio un rato antes. Opcional: un monitor (UptimeRobot) que pegue a `https://<back>.onrender.com/health` cada 5–10 min (directo al back, no por el front).
- Cada `git push` a la rama conectada redeploya los dos servicios.
- Si cambia la URL del front, actualizar `BETTER_AUTH_URL`, los callbacks de GitHub/Google y el rewrite `/api/*` si cambió la del back.
- Si el login anda pero la sesión no persiste, revisar primero `BETTER_AUTH_URL` (tiene que ser exactamente la URL del front, con `https://` y sin `/` final) y que el rewrite 1 sea *Rewrite*.
