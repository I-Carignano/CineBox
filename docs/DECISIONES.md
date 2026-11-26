# DECISIONES — Cinema 24 (TP Final)

Registro de decisiones. Formato: **ID · decisión · por qué · estado**. Las del TP2 siguen vigentes salvo que se indique lo contrario.

## Alcance y consigna

| ID | Decisión | Por qué | Estado |
|---|---|---|---|
| DF01 | Trabajo **individual** con **3 modelos**: Títulos, Calificaciones, Listas | La consigna pide 1 modelo por integrante en grupos de 2–3; el profe aprobó individual "si cubrís los tres modelos" | ✅ Aprobado por el profe (25/11) |
| DF02 | Se mantiene el **repo del TP2** (`I-Carignano/TP2-Peliculas`) | El profe: "hacé un corte y de ahí en adelante PRs" | ✅ Aprobado |
| DF03 | **Corte en F0**: desde ahí, `main` protegida y todo por PR con plantilla; merge commit para conservar el historial granular | Requisito obligatorio 4.1 | ✅ |
| DF04 | La idea tipo Letterboxd/Glynbox | El profe: "me parece correcto, mandale para adelante" | ✅ Aprobado |
| DF05 | Prioridad: obligatorios → 6 opcionales → producto | Con todos los opcionales se llega al 10; el producto no suma puntos pero pesa en la defensa | ✅ |

## Modelos y permisos

| ID | Decisión | Por qué | Estado |
|---|---|---|---|
| DF06 | `Movie` → **`Title`** (`/api/titulos`), con `type: movie \| series` | Películas y series en un solo modelo, sin duplicar CRUD | ✅ |
| DF07 | **Series:** se califica la serie completa u, opcionalmente, una **temporada** (`season` en Rating). Episodios, no | TMDB trae las temporadas; los episodios complican sin sumar | ✅ |
| DF08 | **Títulos solo admin/superadmin** en escritura. El `user` recibe 403 | La lista de verificación pide 403 al user; se deshace el desvío del TP2 (user creaba películas) | ✅ |
| DF09 | El `user` crea, edita y borra **solo sus** calificaciones y listas (403 sobre ajenas) | Sin eso no hay app tipo Letterboxd; aprobado dentro de la idea (DF04) | ✅ |
| DF10 | **Baja lógica** (`active`/`deletedAt`, restaurable) y **física** en los 3 modelos, desde el panel admin, con modales distintos | Requisito obligatorio 4.3 y paso 6 de la evaluación | ✅ |
| DF11 | Se mantienen `superadmin` y las reglas del TP2 (admin gestiona solo `user` y asciende `user → admin`; hook en backend) | Ya funciona y suma al panel de permisos | ✅ |
| DF12 | Puntos y niveles **calculados** (sin modelo propio). Follows como colección de apoyo (F11) | No cuentan como modelo y no hace falta CRUD | ✅ |
| DF26 | Películas existentes cargadas por usuarios `user`: **no se migran**. Quedan en el catálogo (con F1 solo el admin las edita o borra) y `createdBy` queda como dato histórico. La basura (la "h") la borra el admin desde el panel con baja física al cerrar F1. El seed nuevo crea todo a nombre del admin | Lo más simple: sin script ni migración que defender; el permiso depende del rol, no del dueño | ✅ Confirmado por Nacho (26/11) |
| DF27 | Baja en películas: `DELETE /:id` = **baja lógica** (`active: false`, `deletedAt`); `DELETE /:id?permanente=true` = **física**; `PATCH /:id/restaurar`. Lo público filtra `active: { $ne: false }` (los documentos viejos sin el campo cuentan como activos, sin migración). Inactivas: 404 en GET /:id para no admin; el admin las ve con `?estado=inactivas\|todas` | Ambas son "eliminar" (DELETE, como la tabla de la consigna); un solo filtro sirve para dev y prod sin tocar datos | ✅ |

## Catálogo

| ID | Decisión | Por qué | Estado |
|---|---|---|---|
| DF13 | Catálogo desde **TMDB**: precarga (≈2.000 películas y ≈500 series) + **búsqueda bajo demanda** con caché del lado del servidor | Que todo se encuentre (Seven, Dark, Dexter…) sin que los usuarios carguen datos a mano | ✅ |
| DF14 | El cacheo de títulos de TMDB es una operación del sistema, no el CRUD de Títulos | Mantiene el 403 del user sobre `POST /api/titulos` | ✅ |
| DF15 | Atribución de TMDB en footer y README | Condición de uso de la API | ✅ |

## Opcionales

| ID | Decisión | Por qué | Estado |
|---|---|---|---|
| DF16 | Google y paginación: ya hechos en el TP2 | Revalidar en F12 | ✅ |
| DF17 | Panel de **sesiones**: ver y revocar (admin sobre `user`, superadmin sobre todos) | Completa el opcional "sesiones y permisos" | ✅ |
| DF18 | **Swagger 2.0** en `/api/docs`, con todos los endpoints propios | Opcional | ✅ |
| DF19 | Imágenes en **Cloudflare R2**: foto de perfil y pósters/backdrops del admin; en Mongo solo la URL | Opcional; la temática lo justifica | ✅ |
| DF20 | **Agente** con LangChain como la **clase 14**: `@langchain/groq` (`ChatGroq`, modelo `openai/gpt-oss-20b` por `GROQ_MODEL`, temperature 0, streaming), `createAgent` con herramientas `tool()` que llaman a nuestros services y endpoint con SSE. Si la clase 15 (memoria) no sale a tiempo, el historial lo manda el front con los últimos mensajes | Es el patrón de la clase (fácil de defender) y Groq es gratis; reemplaza a Gemini | ✅ (26/11) |

## Diseño e infraestructura

| ID | Decisión | Por qué | Estado |
|---|---|---|---|
| DF21 | **Paleta B: negro y dorado**, con un único dorado `#D4A73C` (botones, estrellas, nivel y barra). Modo oscuro | Elegida por Nacho entre 3 opciones | ✅ |
| DF22 | Logo nuevo: claqueta dorada + "Cinema 24" (Poppins, "24" en dorado) | Acompaña la paleta | ✅ |
| DF23 | Login en tarjeta con pestañas, como Glynbox; sin favoritas fijadas en el perfil | Gusto de Nacho | ✅ |
| DF24 | **Cron job** (cron-job.org) a `/health` cada 10 min para que el backend de Render no se duerma | Un solo servicio gratis entra en las 750 h/mes | ✅ |
| DF25 | `gh` (GitHub CLI) instalado y autenticado para abrir y mergear PRs desde Git Bash | Agiliza el flujo de PRs | ✅ |
