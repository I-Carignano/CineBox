# ESTADO — Cinema 24 (TP Final)

_Actualizado: 26/11/2026_

## Dónde estamos

| Fase | Estado |
|---|---|
| TP2 | ✅ Entregado (repo, front y back en Render, README, checklist, auditoría de secretos sin hallazgos) |
| F0 · Setup del final | ✅ PR #1 `chore/f0-setup-final` mergeado (merge commit `75fbff5`, 6 commits) |
| F1 · Obligatorios sobre lo existente | ⏳ Próxima (4 PRs, ver abajo) |
| F2–F12 | ⏳ |

### Qué dejó F0

- Ruleset **"main protegida"** activo y verificado: deletion, non_fast_forward y pull_request (aprobaciones requeridas: 0). Un push directo a `main` se rechaza (GH013). Desde F0 todo entra por PR.
- `gh` instalado y autenticado como `I-Carignano`.
- Docs del TP2 en `docs/tp2/` (con `git mv`); docs del final, `CLAUDE.md`, `DECISIONES.md` y plantilla de PR en el repo; logos dorados en `frontend/public/brand-gold/` (sin usar hasta F2).
- README con "Metodología de trabajo" (corte TP2 → PRs). SPEC con título del final y el desvío del TP2 marcado como reemplazado por DF08/DF09.
- Verificado: build y lint OK; `.gitignore` cubre `.env` (raíz, backend, frontend) y `.claude/settings.local.json`; `git log --all -- "*.env"` vacío; `GET /health` → 200 sin sesión ni Mongo.

### Plan de F1 (orden de PRs)

| # | Rama | Qué |
|---|---|---|
| 1 | `fix/f1-permisos-backend` | Películas solo admin/superadmin (user → 403), fuera `mine`, seed del admin; docs de estado y decisiones |
| 2 | `fix/f1-permisos-y-redirecciones-frontend` | Fuera `/mis-peliculas`, columna "Vos" y link del header; logout → `/`; mensaje de email vacío; README borrador 4.2 |
| 3 | `feat/f1-baja-logica-backend` | `active`/`deletedAt`, baja lógica, restaurar y baja física; inactivas ocultas en GET, QUERY y GET /:id |
| 4 | `feat/f1-baja-logica-frontend` | Panel Activas/Inactivas, modales distintos para baja lógica y física, restaurar; PLAN_FINAL F1 ✅ |

## Producción (del TP2)

| Qué | URL |
|---|---|
| Frontend | https://tp2-peliculas.onrender.com |
| API | https://tp2-peliculas-api.onrender.com/api |
| Health (cron) | https://tp2-peliculas-api.onrender.com/health |
| Repo | https://github.com/I-Carignano/TP2-Peliculas |

Usuarios de prueba en producción: `superadmin@peliculas.com`, `admin@peliculas.com`, `user@peliculas.com` (contraseñas en el README del repo).

## Repos locales

```
~/source/"Repos VS code"/"TP2 - Peliculas - MYDW"/tp2-peliculas   ← el nuestro
~/source/"Repos VS code"/"TP2 - Peliculas - MYDW"/mdw-2026-ref     ← el del profe (../mdw-2026-ref)
```

**Repo del profe (referencia permanente, solo lectura):** https://github.com/T-Arias/mdw-2026, clonado en `../mdw-2026-ref`. Claude Code lo puede leer. Se consulta siempre que haga falta: patrones de la clase, agente, deploy. Para actualizarlo: `cd ../mdw-2026-ref && git pull`.

Agente de la clase (clase 14, la 15 todavía no salió): `langchain ^1.6.3`, `@langchain/core`, `@langchain/groq`, `zod 4`; `ChatGroq` con `openai/gpt-oss-20b` (`GROQ_MODEL`), temperature 0, streaming; `createAgent({ model, tools, systemPrompt, contextSchema })` con `recursionLimit 10`; herramientas con `tool(fn, { name, description, schema })` que llaman a los services; usuario por `runtime.context`; `POST /api/v1/agent/chat` con SSE (`token`, `tool`, `done`). Variables: `GROQ_API_KEY` (obligatoria) y `GROQ_MODEL`.

## Cuentas y credenciales (los valores van solo al `.env` o a Render, nunca acá)

| Servicio | Para qué | Estado |
|---|---|---|
| MongoDB Atlas | Bases `peliculas-dev` y `peliculas-prod` | ✅ |
| GitHub OAuth (local y prod) | Login | ✅ |
| Google OAuth (publicado) | Login | ✅ |
| Render (Web Service y Static Site) | Deploy | ✅ |
| GitHub CLI (`gh`) | PRs | ✅ autenticado como `I-Carignano` |
| Ruleset "main protegida" | Todo por PR | ✅ verificado (GH013) |
| cron-job.org | Ping a `/health` cada 10 min | ⏳ pendiente (hacerlo ya, durante F1) |
| TMDB (API Read Access Token) | Catálogo | ⏳ F3 |
| Cloudflare R2 | Imágenes | ⏳ F7 |
| **Groq** (API key, gratis) | Agente, como la clase 14 | ⏳ F8 |

## Tareas fuera del código (pendientes, con la fase en que tocan)

| Tarea | Cuándo | Paso a paso |
|---|---|---|
| Cron job keep-alive | **Ya** (durante F1) | cron-job.org → Create cronjob → Title `Cinema 24 keep-alive`, URL `https://tp2-peliculas-api.onrender.com/health`, cada 10 min → guardar y ver que el historial dé 200 |
| Borrar en prod la película de prueba "h" y la basura que hayan cargado users | **Al cerrar F1** (después del PR 4) | Login como admin en prod → panel → baja física con el modal nuevo. Lo válido que cargaron users queda (ver DF26) |
| Fecha de la mesa y formato de la defensa | **Apenas la tengas** | Completar abajo; la entrega es por mail una semana antes |
| Cuenta TMDB y API Read Access Token | **F3** | themoviedb.org → Settings → API → token de lectura → `.env` local y Render |
| Cloudflare R2 (bucket + claves) | **F7** | dash.cloudflare.com → R2 → bucket → API token → `.env` y Render |
| Groq (API key) | **F8** | console.groq.com → API Keys → `.env` y Render |

## Pendientes para completar

- [ ] Fecha de la mesa (la entrega es una semana antes): ______
- [ ] Qué explicó el profe sobre la mesa y la defensa (promoción, formato): ______

## Próximo paso

Arrancar F1 con el PR 1 (`fix/f1-permisos-backend`), con el prompt de `PROMPT_F1.md`. En paralelo, configurar el cron job.
