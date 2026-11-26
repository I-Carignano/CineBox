# CLAUDE.md — Cinema 24, TP Final (Metodologías y Desarrollos Web, UAI)

Sos el desarrollador de este proyecto. Nacho (el alumno, trabajo **individual**) revisa, prueba, commitea, pushea y abre y mergea los PRs. Este archivo manda sobre cualquier costumbre tuya.

## Fuentes de verdad (en este orden)

1. `docs/CONSIGNA_FINAL.md`: lo que se corrige, más los acuerdos con el docente. **Nunca** romper un requisito obligatorio.
2. `docs/SPEC.md`: decisiones técnicas vigentes (modelos, endpoints, formato de errores, rutas del front). Se actualiza en cada fase.
3. `docs/PLAN_FINAL.md`: fases, tareas, ramas y PRs.
4. `docs/DISENO.md`: paleta, componentes y pantallas.
5. `docs/REFERENCIA_PROFE.md` y el repo del profe en `../mdw-2026-ref`, **de solo lectura**: estilo y patrones. Para el agente LLM, seguir las clases 14–15 de ese repo.

`docs/tp2/` es historia del TP2: no es fuente de verdad.

Si una instrucción de Nacho contradice un requisito **obligatorio** de la consigna, no la apliques todavía: decíselo explícitamente ("ojo, esto es obligatorio: …") y esperá confirmación. Si afecta a un opcional o a la SPEC, avisá el impacto y seguí lo que decida. Cuando cambie una decisión, actualizá `docs/SPEC.md` en el mismo paso.

## Forma de trabajo: PRs

- `main` está protegida: **todo entra por Pull Request**. Nunca trabajes sobre `main`.
- Trabajá **una fase (o un PR) de `docs/PLAN_FINAL.md` por vez**. Al empezar, decí qué fase, qué PR y en qué rama.
- Podés crear y cambiar de rama (`git checkout -b feat/…`, `git switch`) y usar `git status` y `git diff`. **No hagas `git commit`, `git push`, `git merge`, `gh pr create` ni `gh pr merge`**: los hace Nacho.
- Los modelos van en **PRs separados de backend y frontend**.
- Al terminar cada PR, frená y entregá siempre:
  1. **Resumen** corto de qué cambió (archivos).
  2. **Prueba en Git Bash**, empezando siempre con el `cd`: `cd ~/source/"Repos VS code"/"TP2 - Peliculas - MYDW"/tp2-peliculas/backend && npm run dev`, más curl o pasos en el navegador con el resultado esperado.
  3. **Comandos de git listos para copiar**: `git add` de archivos puntuales (nunca `git add .` ni `-A`), varios commits chicos convencionales, `git push -u origin <rama>`.
  4. **El comando del PR**, con la descripción completa según `.github/pull_request_template.md`:
     ```bash
     cd ~/source/"Repos VS code"/"TP2 - Peliculas - MYDW"/tp2-peliculas
     gh pr create --base main --head <rama> --title "<tipo>(<scope>): <resumen>" --body "$(cat <<'EOF'
     ## Qué se agregó o modificó
     - ...
     ## Cómo verificarlo
     1. ...
     ## Requisitos de la consigna que cubre
     - ...
     ## Checklist
     - [x] build back y front
     - [x] lint front
     - [x] sin secretos
     EOF
     )"
     ```
  5. **Después del merge**: `gh pr merge <n> --merge --delete-branch` (merge commit, para preservar el historial granular), `git switch main && git pull`.
  6. **Pendientes** y si hay algo para consultar con el profe.
- Commits con prefijo `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `style:`, `test:` y scope `(backend)`, `(frontend)`, `(auth)`, `(deploy)`, `(agent)`.
- La descripción del PR tiene que **coincidir** con lo que hace el diff: la consigna corrige eso.
- Terminal de Nacho: **Git Bash en Windows**. Nada de PowerShell, rutas con `/`.
- Antes de dar algo por terminado: `npm run build` (back y front) sin errores y `npm run lint` en el front.
- No agregues dependencias fuera de las de la SPEC o el PLAN sin preguntar.

## Seguridad: no negociable

- **Nunca** escribas valores reales en archivos versionados: URIs de Mongo con credenciales, `BETTER_AUTH_SECRET`, client secrets de OAuth, token de TMDB, API key del LLM, credenciales de R2.
- `.env` nunca se commitea. Si hace falta una variable, decile a Nacho qué completar en su `.env` y sumala vacía a `backend/.env.example` en el mismo PR.
- Si detectás un secreto en un archivo o en el historial, frená todo y avisá.
- Errores 500: el detalle va a `console.error`, nunca al cliente. Las claves de terceros (TMDB, LLM, R2) se usan **solo en el backend**.

## Convenciones de código

- Las del profe (`docs/REFERENCIA_PROFE.md`): identificadores en inglés, comentarios y mensajes en español rioplatense claro ("No tenés permisos…"), un comentario de propósito al principio de cada archivo, capas routes → controllers → services → models, imports ESM con `.js` en el backend.
- TypeScript `strict`, sin `any` (si hace falta, `unknown` + type guard).
- Recursos públicos en español y plural, sin `/v1`: `/api/titulos`, `/api/calificaciones`, `/api/listas`.
- Formato de error único de la SPEC. Códigos: 201, 204, 400, 401, 403, 404.
- **Baja lógica** = `active: false` + `deletedAt` (restaurable, oculta en lo público). **Baja física** = eliminación definitiva. Las dos con su endpoint y su modal.
- Express 5: `req.query` es de solo lectura; la query validada va en `res.locals.query`. Zod estricto, sin `.default()` en los schemas de crear o editar.
- Front: la sesión sale **solo** de `useSession()`; los datos, de RTK Query; los formularios, de React Hook Form + Zod con `noValidate`. Axios con `baseURL: "/api"`.
- UI: Tailwind v4 con los tokens de `docs/DISENO.md`, mobile-first, estados de carga, vacío y error en cada pantalla, accesible.

## README final (F12): tiene que tener sí o sí

1. Nombre y descripción funcional de Cinema 24.
2. Integrantes y modelo a cargo (individual: Ignacio Carignano, los 3 modelos), con los campos y tipos de cada modelo.
3. Stack y arquitectura (diagrama simple: front → rewrite `/api` → API → Mongo Atlas, TMDB, R2, LLM).
4. URLs de producción (front, API, Swagger `/api/docs`).
5. Requisitos previos, instalación y ejecución local (Node 22, comandos por carpeta, seed).
6. Variables de entorno (tabla: nombre, para qué, dónde se obtiene).
7. Endpoints: método, ruta, rol requerido y respuestas, para los 3 modelos y los auxiliares.
8. Roles y permisos (tabla user / admin / superadmin), con los acuerdos con el docente.
9. Usuarios de prueba (admin y user, más superadmin) con contraseña.
10. Opcionales implementados y dónde verlos.
11. Metodología: ramas, PRs y el corte del TP2.
12. Créditos: TMDB (texto obligatorio de atribución).

## Definición de "terminado" para todo el TP

Recorrer `docs/CONSIGNA_FINAL.md` línea por línea en `docs/CHECKLIST_FINAL.md` y marcar cada requisito con dónde se cumple (archivo, URL o PR). Lo que no esté cubierto se reporta, no se esconde.
