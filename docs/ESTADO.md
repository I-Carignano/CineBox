# ESTADO — CineBox (TP Final)

_Actualizado: 27/11/2026_

> **CineBox** es el nombre nuevo de Cinema 24 (DF28). Las URLs de Render no cambian.

## Dónde estamos

| Fase | Estado |
|---|---|
| TP2 | ✅ Entregado (repo, front y back en Render, README, checklist, auditoría de secretos sin hallazgos) |
| F0 · Setup del final | ✅ PR #1 `chore/f0-setup-final` mergeado (merge commit `75fbff5`, 6 commits) |
| F1 · Obligatorios sobre lo existente | ✅ PRs #2 a #5 mergeados (26/11): permisos solo admin, logout a inicio, mensajes de login, baja lógica y física con panel y modales. En prod, la "h" y la basura de users borradas con baja física (DF26) |
| F2 · Marca, paleta, layout y login con pestañas | 🔄 En curso: PR 1 `feat/f2-marca-y-tema` |
| F3–F12 | ⏳ |

### Plan de F2 (orden de PRs)

| # | Rama | Qué |
|---|---|---|
| 1 | `feat/f2-marca-y-tema` | Marca CineBox (favicon, título, header, login), paleta negro y dorado en `@theme` (fuera los rojos `brand-*`), tipografías, borrar `cinema24-brand/` y `brand-gold/`, renombrar "Cinema 24" → "CineBox" en código y docs |
| 2 | `feat/f2-layout-responsive` | Barra superior en desktop, barra inferior en mobile, componentes base (botón, chip, tarjeta, póster, estrellas, modal, carrusel, skeletons) |
| 3 | `feat/f2-login-pestanas` | Login y registro en una tarjeta con pestañas y "o continuá con" Google y GitHub |

### Qué dejó F0

- Ruleset **"main protegida"** activo y verificado: deletion, non_fast_forward y pull_request (aprobaciones requeridas: 0). Un push directo a `main` se rechaza (GH013). Desde F0 todo entra por PR.
- `gh` instalado y autenticado como `I-Carignano`.
- Docs del TP2 en `docs/tp2/` (historial: conservan el nombre Cinema 24); docs del final, `CLAUDE.md`, `DECISIONES.md` y plantilla de PR en el repo.

## Producción

| Qué | URL |
|---|---|
| Frontend | https://tp2-peliculas.onrender.com |
| API | https://tp2-peliculas-api.onrender.com/api |
| Health (cron) | https://tp2-peliculas-api.onrender.com/health |
| Repo | https://github.com/I-Carignano/CineBox (el link viejo `TP2-Peliculas` redirige) |

Renombrar servicios en Render **no** cambia estas URLs. No se crean servicios nuevos (habría que rehacer los callbacks de OAuth).

Usuarios de prueba en producción: `superadmin@peliculas.com`, `admin@peliculas.com`, `user@peliculas.com` (contraseñas en el README del repo hasta F12; después, solo en el mail de entrega).

## Repos locales

```
~/source/"Repos VS code"/"TP2 - Peliculas - MYDW"/tp2-peliculas   ← el nuestro (remoto: I-Carignano/CineBox; la carpeta local conserva el nombre)
~/source/"Repos VS code"/"TP2 - Peliculas - MYDW"/mdw-2026-ref     ← el del profe (../mdw-2026-ref)
```

**Repo del profe (referencia permanente, solo lectura):** https://github.com/T-Arias/mdw-2026, clonado en `../mdw-2026-ref`. Claude Code lo puede leer. Para actualizarlo: `cd ../mdw-2026-ref && git pull`.

Agente de la clase (clase 14, la 15 todavía no salió): `langchain ^1.6.3`, `@langchain/core`, `@langchain/groq`, `zod 4`; `ChatGroq` con `openai/gpt-oss-20b` (`GROQ_MODEL`), temperature 0, streaming; `createAgent({ model, tools, systemPrompt, contextSchema })` con `recursionLimit 10`; herramientas con `tool(fn, { name, description, schema })` que llaman a los services; usuario por `runtime.context`; `POST /api/v1/agent/chat` con SSE (`token`, `tool`, `done`). Variables: `GROQ_API_KEY` (obligatoria) y `GROQ_MODEL`.

## Cuentas y credenciales (los valores van solo al `.env` o a Render, nunca acá)

| Servicio | Para qué | Estado |
|---|---|---|
| MongoDB Atlas | Bases `peliculas-dev` y `peliculas-prod` (no se renombran) | ✅ |
| GitHub OAuth (local y prod) | Login | ✅ (callbacks sin cambios; nombre visible opcional → "CineBox") |
| Google OAuth (publicado) | Login | ✅ (no tocar la pantalla de consentimiento hasta F12) |
| Render (Web Service y Static Site) | Deploy | ✅ (verificar que siga conectado al repo renombrado) |
| GitHub CLI (`gh`) | PRs | ✅ autenticado como `I-Carignano` |
| Ruleset "main protegida" | Todo por PR | ✅ verificado (GH013); sigue igual tras el rename |
| cron-job.org | Ping a `/health` cada 10 min | ✅ `CineBox keep-alive` (verificar historial en 200) |
| TMDB (API Read Access Token) | Catálogo | ⏳ F3 |
| Cloudflare R2 | Imágenes | ⏳ F7 |
| **Groq** (API key, gratis) | Agente, como la clase 14 | ⏳ F8 |

## Tareas fuera del código (pendientes, con la fase en que tocan)

| Tarea | Cuándo | Paso a paso |
|---|---|---|
| Renombrar el repo a `CineBox` | **Ya** (antes del PR 1 de F2) | GitHub → repo → Settings → General → Repository name `CineBox` → Rename. Después, en local: `git remote set-url origin https://github.com/I-Carignano/CineBox.git` |
| Render conectado al repo nuevo | Después del rename | En cada servicio → Settings → Build & Deploy → Repository debe decir `I-Carignano/CineBox`; si da error, Connect/Edit y elegir `CineBox` (rama `main`) |
| Cron job keep-alive | **Ya** | cron-job.org → Create cronjob (o editar el existente) → Title `CineBox keep-alive`, URL `https://tp2-peliculas-api.onrender.com/health`, cada 10 min → guardar y ver 200 en el historial |
| Fecha de la mesa y formato de la defensa | **Apenas la tengas** | Completar abajo; la entrega es por mail una semana antes |
| Cuenta TMDB y API Read Access Token | **F3** | themoviedb.org → Settings → API → token de lectura → `.env` local y Render |
| Cloudflare R2 (bucket + claves) | **F7** | dash.cloudflare.com → R2 → bucket → API token → `.env` y Render |
| Groq (API key) | **F8** | console.groq.com → API Keys → `.env` y Render |
| Sacar contraseñas de prueba del README | **F12** | Que queden solo en el mail de entrega |

## Pendientes para completar

- [ ] Fecha de la mesa (la entrega es una semana antes): ______
- [ ] Qué explicó el profe sobre la mesa y la defensa (promoción, formato): ______

## Próximo paso

1. Renombrar el repo a `CineBox`, actualizar el remoto local y verificar Render.
2. Confirmar el cron `CineBox keep-alive` en 200.
3. F2 · PR 1 `feat/f2-marca-y-tema` (prompt en `f2/PROMPT_F2.md`).
