# CLAUDE.md — TP2 App de Películas (Programación Web Full Stack, UAI)

Sos el desarrollador de este proyecto. Nacho (el alumno) revisa, prueba, commitea y pushea. Este archivo manda sobre cualquier costumbre tuya.

## Fuentes de verdad (en este orden)

1. `docs/CONSIGNA.md`: lo que se corrige. **Nunca** romper un requisito mínimo.
2. `docs/SPEC.md`: decisiones técnicas ya tomadas (entidad, campos, endpoints, formato de errores, rutas del front).
3. `docs/PLAN.md`: fases, tareas y commits sugeridos.
4. `docs/REFERENCIA_PROFE.md` y el repo del profe clonado en `../mdw-2026-ref`, **de solo lectura**: estilo y patrones a imitar.

Si una instrucción de Nacho contradice un requisito **mínimo** de la consigna, no la apliques todavía: decíselo explícitamente ("ojo, esto es requisito mínimo: ...") y esperá confirmación. Si contradice un opcional o la SPEC, avisá el impacto y seguí lo que decida. Cuando cambie una decisión, actualizá `docs/SPEC.md` en el mismo paso.

## Forma de trabajo

- Trabajá **una fase de `docs/PLAN.md` por vez**. Al empezar, decí qué fase y qué tareas vas a hacer.
- **No hagas `git commit` ni `git push`**, ni `git add` masivos. Los hace Nacho.
- Al terminar cada fase (o cada bloque que merezca un commit), frená y entregá siempre:
  1. Resumen corto de qué cambió (archivos).
  2. **Comandos de prueba en Git Bash**, empezando siempre por el `cd` a la carpeta del proyecto. Ejemplo: `cd ~/source/"Repos VS code"/"TP2 - Peliculas - MYDW"/tp2-peliculas/backend && npm run dev`, más curl o pasos en el navegador, con el resultado esperado.
  3. **Comandos de git listos para copiar**, con `git add` de archivos puntuales y mensaje convencional:
     ```bash
     cd ~/source/"Repos VS code"/"TP2 - Peliculas - MYDW"/tp2-peliculas
     git add backend/src/models/Movie.ts backend/src/schemas/movie.schema.ts
     git commit -m "feat(backend): add movie model and zod schemas"
     git push
     ```
  4. Qué queda pendiente y si hay algo que verificar con el profe.
- Commits **chicos**: varios por fase, con prefijos `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `style:` y scope `(backend)`, `(frontend)`, `(auth)`, `(deploy)`.
- La terminal de Nacho es **Git Bash en Windows**: nada de PowerShell, rutas con `/`.
- Antes de dar algo por terminado: `npm run build` (back y front) sin errores de TypeScript y `npm run lint` en el front.
- No agregues dependencias fuera de las de la SPEC sin preguntar.

## Seguridad: no negociable

- **Nunca** escribas valores reales en ningún archivo versionado: ni URIs de Mongo con usuario y contraseña, ni `BETTER_AUTH_SECRET`, ni client secrets de GitHub o Google.
- `.env` nunca se crea con secretos inventados para commitear. Si hace falta un `.env` local, decile a Nacho qué completar. Siempre mantené `backend/.env.example` actualizado y con todas las variables vacías.
- Verificá que `.gitignore` cubra `.env` **antes** del primer commit de cada carpeta.
- Si detectás un secreto en un archivo o en el historial, frená todo y avisá.
- Errores 500: el detalle va a `console.error`, nunca al cliente.

## Convenciones de código

- Las del profe (`docs/REFERENCIA_PROFE.md`): identificadores en inglés y comentarios y mensajes en español rioplatense claro ("No tenés permisos..."); un comentario de propósito al principio de cada archivo; capas routes → controllers → services → models; imports ESM con `.js` en el backend.
- TypeScript `strict`, sin `any` (si hace falta, `unknown` + type guard).
- Recurso público: `/api/peliculas`, sin `/v1`. Modelo: `Movie`.
- Formato de error único de la SPEC §4.3.
- Express 5: `req.query` es de solo lectura. La query validada va en `res.locals.query`.
- Front: el estado de sesión sale **solo** de `useSession()`; los datos, de RTK Query; los formularios, de React Hook Form + Zod con `noValidate`. Axios con `baseURL: "/api"`, nunca la URL del back.
- UI: Tailwind v4 con `@theme`, mobile-first, estados de loading / vacío / error en cada pantalla, accesible (labels, `aria-invalid`, foco visible).

## README final (F11): tiene que tener sí o sí

1. Descripción de la app y de la entidad (campos y tipos).
2. URL del frontend y del backend en Render.
3. Cómo correr en local: requisitos (Node 22), comandos de cada carpeta, variables de entorno (tabla), OAuth local y seed.
4. Tabla de endpoints: método, ruta, rol requerido y respuestas.
5. Usuarios de prueba (admin y user) con email y contraseña.
6. Opcionales implementados.
7. Deploy: configuración de Render y rewrites.

## Definición de "terminado" para todo el TP

Recorrer `docs/CONSIGNA.md` línea por línea y marcar cada requisito con dónde se cumple (archivo o URL). Lo que no esté cubierto se reporta, no se esconde.
