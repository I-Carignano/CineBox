# PLAN FINAL — Cinema 24 (TP Final MDW 2026)

Plan de fases para llevar el TP2 al trabajo final. Fuente de verdad de lo que se corrige: `docs/CONSIGNA_FINAL.md`. Decisiones técnicas vigentes: `docs/SPEC.md` (se actualiza en cada fase). Diseño: `docs/DISENO.md`.

> **Regla de oro.** Primero lo obligatorio (el 4), después los 6 opcionales (el 10), después el producto (lo tipo Glynbox). Si una tarea de producto pone en riesgo un obligatorio, gana el obligatorio.

## 0. Visión del producto

**Cinema 24** es una app para registrar, calificar y descubrir películas y series. El catálogo sale de TMDB (precargado más búsqueda bajo demanda). Cada usuario marca lo que vio, califica (0,5 a 5), reseña, guarda para ver, arma listas, y la app aprende sus gustos: recomendaciones, modo deslizar, "¿Qué veo hoy?", estadísticas, niveles y un agente conversacional que recomienda con datos reales de la base. Referencia visual y funcional: Glynbox (capturas en el proyecto de Claude), pero mejor resuelto.

## 1. Modelos propios (3, alumno individual)

Los tres tienen CRUD completo, panel de admin, vista pública, **baja lógica** (`active: false` + `deletedAt`, restaurable, oculta en lo público) y **baja física** (eliminación definitiva). Los usuarios, sesiones y cuentas de Better Auth **no cuentan**.

### 1.1 `Title` → `/api/titulos` (catálogo de películas y series)

Evoluciona el `Movie` del TP2 (`/api/peliculas` pasa a `/api/titulos` en F3, con migración de las 31 películas).

| Campo | Tipo | Notas |
|---|---|---|
| `type` | enum `movie` \| `series` | requerido |
| `title` / `originalTitle` | string | requerido / opcional |
| `overview` | string | sinopsis |
| `releaseDate` | Date | estreno (series: primer episodio) |
| `runtimeMinutes` | number | películas: duración; series: duración media del episodio |
| `genres` | string[] | normalizados a nuestra lista |
| `directors` | string[] | series: creadores |
| `cast` | `{ name, character }[]` | top 10 |
| `posterUrl` / `backdropUrl` | string (URL) | TMDB o R2 |
| `tmdbId` | number | único junto con `type`; `null` en altas manuales |
| `tmdbRating` | number | 0–10, informativo |
| `seasons` | `{ number, name, episodeCount, airDate }[]` | solo series |
| `providersAR` | `{ name, logoUrl }[]` | dónde verla en Argentina (TMDB watch providers) |
| `source` | enum `tmdb` \| `manual` | |
| `featured` | boolean | para el carrusel de destacadas |
| `active` / `deletedAt` | boolean / Date | baja lógica |
| `createdBy` | string | admin que lo creó (manuales) |

**Permisos:** lectura pública. POST/PUT/PATCH/DELETE **solo `admin` y `superadmin`** (`requireRole`). Un `user` recibe **403**.

**Catálogo:** precarga desde TMDB (≈2.000 películas y ≈500 series populares) con un script y una acción de admin. **Búsqueda bajo demanda:** `GET /api/titulos?search=` devuelve lo local y `GET /api/tmdb/buscar?q=` lo que todavía no está; al abrir un resultado de TMDB, `GET /api/titulos/tmdb/:type/:tmdbId` lo trae y lo **cachea** (operación de sistema e idempotente: el `user` nunca usa el CRUD de Títulos).

### 1.2 `Rating` → `/api/calificaciones` (lo que cada usuario hace con un título)

| Campo | Tipo | Notas |
|---|---|---|
| `userId` | string | dueño (lo pone el server) |
| `titleId` | ObjectId → Title | requerido |
| `season` | number \| null | `null` = la serie o película completa; número = esa temporada |
| `score` | number | 0,5 a 5 en pasos de 0,5; opcional (podés marcar "la vi" sin puntuar) |
| `watched` | boolean | "La vi" |
| `liked` | boolean | "Me gusta" |
| `watchlist` | boolean | "Para ver" |
| `review` | string | reseña opcional (máx. 2.000) |
| `hasSpoilers` | boolean | |
| `watchedAt` | Date | fecha en que la vio (default: hoy si `watched`) |
| `active` / `deletedAt` | boolean / Date | baja lógica (moderación del admin) |

Índice único `(userId, titleId, season)`.

**Permisos:** lectura pública de reseñas activas. El `user` crea, edita y borra **solo las suyas** (403 sobre ajenas). `admin`/`superadmin`: todas, con moderación (baja lógica = ocultar reseña; física = eliminar).

### 1.3 `List` → `/api/listas`

| Campo | Tipo | Notas |
|---|---|---|
| `ownerId` | string | lo pone el server |
| `name` | string | requerido, 1–80 |
| `description` | string | opcional |
| `isPublic` | boolean | default `true` |
| `items` | `{ titleId, note, addedAt }[]` | orden = orden de la lista |
| `active` / `deletedAt` | boolean / Date | baja lógica |

**Permisos:** públicas visibles para todos; privadas solo para el dueño y el admin. El `user` gestiona **solo las suyas**. Admin: todas.

### 1.4 Colecciones de apoyo (no cuentan como modelo)

- `Follow` (F11): `{ followerId, followedId, createdAt }`.
- Puntos y nivel: **se calculan** a partir de Ratings y Lists (sin colección propia salvo que haga falta cachear).

## 2. Roles

| Acción | user | admin | superadmin |
|---|---|---|---|
| Ver catálogo, reseñas y listas públicas | ✅ | ✅ | ✅ |
| CRUD de **Títulos** | ❌ 403 | ✅ | ✅ |
| Sus calificaciones y listas | ✅ | ✅ | ✅ |
| Calificaciones y listas ajenas | ❌ 403 | ✅ (moderación) | ✅ |
| Panel admin (`/admin/*`) | ❌ (redirige con "sin permisos") | ✅ | ✅ |
| Usuarios: listar, dar de baja, eliminar, ascender a admin | ❌ | ✅ solo sobre `user` | ✅ sobre todos |
| Sesiones: ver y revocar | ❌ | ✅ solo de `user` | ✅ de todos |
| Cambiar roles | ❌ | ✅ solo `user → admin` | ✅ cualquiera |

Reglas que siguen del TP2: nadie se cambia el propio rol, el hook `user-management-guard` aplica las restricciones en el backend.

## 3. Flujo de trabajo con PRs (desde F0)

1. Una **rama por PR**: `feat/…`, `fix/…`, `chore/…`, `docs/…` (ej.: `feat/f4-calificaciones-backend`).
2. Commits chicos y convencionales dentro de la rama.
3. Push de la rama y PR a `main` con la plantilla (`.github/pull_request_template.md`): **qué se agregó, cómo verificarlo, requisitos de la consigna que cubre**.
4. Merge con **merge commit** (preserva el historial granular), borrar la rama, `git checkout main && git pull`.
5. `main` protegida con un ruleset: solo entra por PR. Render despliega solo con cada merge.

Cada modelo tiene **PRs separados de backend y frontend** (lo pide la consigna para la autoría).

## 4. Fases

Estado: ⏳ pendiente · 🔄 en curso · ✅ hecha.

### F0 — Setup del final ✅
- Mover los docs del TP2 a `docs/tp2/` (CONSIGNA, PLAN, CHECKLIST). `SPEC.md` sigue como spec viva (renombrar el título a "TP Final").
- Sumar `docs/CONSIGNA_FINAL.md`, `docs/PLAN_FINAL.md`, `docs/DISENO.md`, `.github/pull_request_template.md`, `CLAUDE.md` nuevo y logos en dorado (`frontend/public/brand-gold/`, sin activarlos todavía).
- README: nota de "corte" (historial previo = TP2, desde F0 todo por PR).
- Fuera del código (Nacho): ruleset de `main` en GitHub y cron job a `/health` cada 10 min.
- **PR:** `chore/f0-setup-final` — el primer PR del proyecto.

#### Hallazgos de la auditoría F0 (no contemplados en las fases)
Lo que la auditoría encontró y no estaba explícito en el plan. Lo ya cubierto (permisos de `user`, `mine`, baja lógica, logout, redirecciones, Swagger, sesiones) sigue en su fase.
- **F1 — datos existentes:** el seed ya crea las películas con `createdBy` = admin, pero en dev y prod pueden quedar películas creadas por usuarios `user` (incluida la de prueba "h" en prod). Revisarlas y reasignarlas al admin o borrarlas antes de quitar el permiso.
- **F1 — limpieza del modelo de dueño:** quitar `lib/ownership.ts` (`canModifyMovie`) y el `canWrite` con `"user"` de `movies.routes.ts`, el `mine` de los schemas (GET y QUERY), `MovieManager` con `scope="mine"`, la columna "Vos" y el link "Mis películas" del header.
- **F1 — baja lógica en todas las lecturas:** el filtro `active: true` va en el listado, en `QUERY` **y** en `GET /:id` (un inactivo da 404 en lo público); el admin necesita ver inactivos con un filtro propio.
- **F1 — login con email vacío:** hoy muestra "El email no tiene un formato válido"; la consigna pide errores claros para **campos vacíos** → mensaje "El email es obligatorio" antes de validar el formato (login y registro).
- **F8 — agente:** el repo del profe solo publicó la clase 14 (agente **sin memoria**: cada pregunta es independiente); la memoria es "clase 15" y todavía no está. El "historial de la conversación" de F8 depende de eso (o se resuelve mandando los últimos mensajes desde el front). `docs/SPEC.md` §2 dice "no se usa LangChain": se actualiza en F8.
- **F12 — `.env.example`:** tiene `NODE_ENV`, que hoy el código no lee; documentarla o sacarla en la tabla de variables.

### F1 — Obligatorios sobre lo existente ✅ (asegura el 4 con un modelo)
- Películas **solo admin/superadmin** en escritura: quitar el permiso de `user`, `/mis-peliculas` y el filtro `mine`. `user` → 403. Ajustar el seed (las películas pasan a ser del admin).
- **Baja lógica y física** en películas: `active`/`deletedAt`, endpoints o query para desactivar/restaurar y DELETE físico; el público solo ve activas; el panel admin muestra "Activas / Inactivas", con **modal** distinto para cada acción.
- **Logout → inicio (`/`)**. Ruta privada sin sesión → `/login` con vuelta a donde iba.
- Login/registro: errores visibles para campos vacíos y credenciales inválidas (verificar y completar).
- README: secciones obligatorias de 4.2 (integrantes y modelos, arquitectura) en borrador.
- **PRs (en este orden):** `fix/f1-permisos-backend` (#2), `fix/f1-permisos-y-redirecciones-frontend` (#3), `feat/f1-baja-logica-backend` (#4), `feat/f1-baja-logica-frontend`.
- **Al cerrar F1 (Nacho, en producción):** borrar la película de prueba "h" y la basura que hayan cargado users, con baja física desde el panel (DF26).

### F2 — Base de UI (paleta y layout) ⏳
- Paleta B (ver `DISENO.md`) en `@theme`, modo oscuro, tipografía; activar logo y favicon de `brand-gold/` y borrar `cinema24-brand/`.
- Layout responsive: barra superior en desktop, **barra inferior** en mobile (Inicio, Buscar, Qué veo, Comunidad, Perfil).
- Login/registro en **una tarjeta con pestañas** ("Iniciar sesión / Crear cuenta") y "o continuá con" Google y GitHub.
- Componentes base: botón, chip, tarjeta, póster, estrellas con medias, modal, carrusel horizontal, skeletons.
- **PRs:** `feat/f2-tema-y-layout`, `feat/f2-login-pestanas`.

### F3 — Títulos con TMDB ⏳ (modelo 1)
- Migrar `Movie` → `Title` (`/api/titulos`), con script de migración de las 31 películas.
- Cliente TMDB (token en `.env`), import de populares (películas y series, con elenco, directores, temporadas y plataformas AR), búsqueda bajo demanda con caché.
- Detalle de título: backdrop, datos, elenco, temporadas, dónde verla, promedio de la comunidad.
- Crédito de TMDB en footer y README.
- Admin: CRUD de títulos (alta manual, edición, baja lógica/física, "destacado").
- **PRs:** `feat/f3-titulos-backend`, `feat/f3-tmdb-import`, `feat/f3-titulos-frontend`.

### F4 — Calificaciones ⏳ (modelo 2)
- Backend `/api/calificaciones` con CRUD, validación, dueño, baja lógica/física y paginación.
- Front: acciones en el detalle (La vi / Me gusta / puntaje / Para ver / reseña), con temporada opcional en series; reseñas públicas en el detalle; panel admin de moderación.
- **PRs:** `feat/f4-calificaciones-backend`, `feat/f4-calificaciones-frontend`.

### F5 — Listas ⏳ (modelo 3)
- Backend `/api/listas` con CRUD, dueño, visibilidad, baja lógica/física y paginación.
- Front: crear/editar listas, agregar desde el detalle, ver listas públicas, panel admin.
- **PRs:** `feat/f5-listas-backend`, `feat/f5-listas-frontend`.

### F6 — Swagger y sesiones ⏳ (+2)
- **Swagger 2.0** (`swagger: "2.0"`) servido en `/api/docs`, con **todos** los endpoints propios y los principales de auth.
- Panel de **sesiones**: listar sesiones activas por usuario y revocar una o todas (`admin.listUserSessions`, `revokeUserSession(s)`), respetando las reglas de rol.
- **PRs:** `feat/f6-swagger`, `feat/f6-panel-sesiones`.

### F7 — Imágenes en Cloudflare R2 ⏳ (+1)
- Bucket R2, subida desde el backend o con URL prefirmada; en Mongo **solo la URL**.
- Usos: **foto de perfil** y **póster/backdrop** de títulos cargados por el admin. Validar tipo y tamaño.
- **PRs:** `feat/f7-r2-backend`, `feat/f7-r2-frontend`.

### F8 — Agente LLM ⏳ (+1)
- Seguir el patrón del agente de las **clases 14–15** del repo del profe (`../mdw-2026-ref`), con LangChain. Modelo: **Groq (como la clase 14)**, `ChatGroq` con `openai/gpt-oss-20b` (API key gratis en console.groq.com; ver DF20).
- Herramientas que consultan **nuestra base**: `buscar_titulos(filtros)`, `detalle_titulo(id)`, `mis_calificaciones()`, `recomendar(criterios)`, `que_veo_hoy(tipo, compania, ganas, tiempo)`.
- Burbuja flotante en el front con historial de la conversación; requiere sesión para las herramientas personales. Límite simple de uso.
- **PRs:** `feat/f8-agente-backend`, `feat/f8-agente-frontend`.

### F9 — Descubrir ⏳ (producto)
- **Inicio:** carrusel de destacadas, Modo deslizar y ¿Qué veo hoy? (accesos), Recomendado para vos, Tendencias en Cinema 24 (más calificados en 7 días), Populares (TMDB), Novedades de quienes seguís (F11).
- **Modo deslizar:** un póster por vez con La vi / Me gusta / puntaje / Para ver / Pasar; texto corto que explique para qué sirve (calificar lo que ya viste para mejorar tus recomendaciones). Excluye lo ya calificado.
- **¿Qué veo hoy?:** película o serie, con quién, qué ganas, cuánto tiempo → filtros de género y duración, excluye lo visto, resultados que se pueden ir pasando.
- **Descubrir:** filtros por tipo, género, año, plataforma y orden.
- **Recomendaciones** por contenido: puntaje por géneros, directores y actores de lo que calificaste alto (≥ 4) y penalización de lo que calificaste bajo.
- **PRs:** `feat/f9-inicio`, `feat/f9-deslizar`, `feat/f9-que-veo-hoy`, `feat/f9-recomendaciones`.

### F10 — Perfil ⏳ (producto)
- Perfil público `/u/:username`: avatar, nivel con barra de puntos, contadores (vistas, reseñas, seguidores, siguiendo), redes (Instagram, LinkedIn, Letterboxd).
- Pestañas: Perfil (actividad reciente), Ya vi, Para ver, Me gusta, Listas, Reseñas, Estadísticas; vista en grilla o carrusel. **Sin favoritas fijadas.**
- **Estadísticas** (aggregation pipelines): películas y series vistas, horas, vistas por mes, género, década, director y actor más vistos, mejor y peor calificada.
- **Puntos y niveles:** calificar +1, reseña de 50+ caracteres +3, lista pública con 5+ títulos +2. Niveles: Espectador 0 · Aficionado 50 · Cinéfilo 150 · Crítico 350 · Experto 700 · Leyenda 1.500.
- **PRs:** `feat/f10-perfil-publico`, `feat/f10-estadisticas`, `feat/f10-niveles`.

### F11 — Comunidad ⏳ (extra, si hay tiempo)
- Seguir/dejar de seguir, buscar usuarios, feed de actividad de los que seguís, ranking por puntos.
- **PRs:** `feat/f11-seguir`, `feat/f11-feed-y-ranking`.

### F12 — Cierre y defensa ⏳
- Seed de los 3 modelos con datos de ejemplo en producción (la vista pública nunca vacía).
- README profesional final (ver `CLAUDE.md`), `.env.example` completo, Swagger completo.
- Checklist contra `CONSIGNA_FINAL.md` (requisito → dónde se cumple) en `docs/CHECKLIST_FINAL.md`.
- Auditoría: `git log --all -- "*.env"` vacío y búsqueda de secretos en el historial; todos los cambios desde F0 por PR con descripción.
- Prueba completa en producción siguiendo §6 de la consigna (Chrome).
- **Guía del coloquio** `docs/COLOQUIO.md`: para cada modelo, el recorrido formulario → estado (RTK Query) → ruta → middlewares → controller → service → Mongo, con archivos y líneas clave; preguntas probables y respuestas.
- Mail de entrega (plantilla en `CONSIGNA_FINAL.md` §7).

## 5. Mapa de requisitos → fases

| Requisito | Fase |
|---|---|
| PRs con descripción, sin commits directos | F0 en adelante |
| Baja lógica y física | F1 (películas), F3, F4, F5 |
| Logout al inicio, redirecciones, errores de login | F1 |
| README profesional | F1 (borrador) y F12 |
| 3 modelos con CRUD, admin y vista pública | F3, F4, F5 |
| Datos de ejemplo en todos los modelos | F3–F5 (seed) y F12 |
| Google · Paginación | ✅ TP2 (revalidar en F12) |
| Panel de sesiones y permisos | F6 (+ lo del TP2) |
| Swagger 2.0 | F6 |
| Imágenes en R2 | F7 |
| Agente LLM | F8 |
