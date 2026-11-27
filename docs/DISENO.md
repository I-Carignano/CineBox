# DISEÑO — CineBox (TP Final)

Guía visual y de interfaz. Referencia funcional: **Glynbox** (capturas en el proyecto de Claude de Nacho). La idea es tomar su estructura y resolverla mejor: con datos que cargan bien, estadísticas que se calculan de verdad y una versión de escritorio cuidada, no un celular estirado.

## 1. Paleta (elegida: B, negro y dorado)

Modo oscuro único. **Un solo dorado** para todo lo destacado: botones principales, pestaña activa, estrellas, puntajes, nivel y barra de puntos.

| Token (`@theme`) | Hex | Uso |
|---|---|---|
| `--color-bg` | `#0A0A0B` | fondo de página |
| `--color-surface` | `#16161A` | tarjetas, modales, inputs |
| `--color-surface-2` | `#1E1E24` | hover de tarjetas, chips inactivos |
| `--color-border` | `#26262C` | bordes y divisores |
| `--color-text` | `#F5F5F7` | texto principal |
| `--color-muted` | `#A1A1AA` | texto secundario |
| `--color-gold` | `#E8AD33` | acento único: CTA, activo, estrellas, nivel, barra de puntos |
| `--color-gold-hover` | `#CF9727` | hover y active del dorado |
| `--color-gold-soft` | `rgba(232,173,51,.15)` | fondo de pills y pestaña activa |
| `--color-on-gold` | `#0A0A0B` | texto sobre dorado |
| `--color-danger` | `#EF4444` | eliminar, errores |
| `--color-success` | `#22C55E` | confirmaciones, "disponible" |

Reglas: el dorado no se usa en párrafos largos; los errores van en rojo con texto descriptivo; contraste AA mínimo.

El dorado sale del logo de CineBox (muestreado: `#E2AA36`–`#EBAE30`); reemplaza al `#D4A73C` original para que botones y logo sean el mismo color (DF21). Los rojos de la marca vieja (`brand-*`) desaparecen.

Contraste verificado (WCAG): `on-gold` sobre `gold` 9,9:1 · `gold` sobre `surface` 9,0:1 · `on-gold` sobre `gold-hover` 7,6:1 · `muted` sobre `surface` 7,0:1 y sobre `surface-2` 6,5:1. Todo AA (y AAA en texto normal). El dorado sobre blanco da 2:1: no usarlo como texto sobre fondos claros.

## 2. Marca

Nombre: **CineBox** (antes Cinema 24; ver DF28). Logo: claqueta dorada + wordmark "Cine**Box**" ("Cine" blanco, "Box" dorado).

Archivos en `frontend/public/brand/` (reemplaza a `brand-gold/` y a `cinema24-brand/`, que se borran):

| Archivo | Tamaño | Uso |
|---|---|---|
| `favicon.ico` | 16/32/48/64/256 | pestaña del navegador |
| `favicon-32.png` | 32×32 | favicon PNG |
| `apple-touch-icon.png` | 180×180, fondo `#0A0A0B` | iOS (acceso directo) |
| `icon-192.png` · `icon-512.png` | transparentes | `site.webmanifest` (PWA) |
| `icon-clapper.png` | 256 px de alto, transparente | claqueta sola: header |
| `logo-cinebox-dark-bg.png` | 1195×297, transparente | logo completo sobre fondo oscuro: login, 404, README |
| `logo-cinebox-light-bg.png` | 1195×297, transparente | logo sobre fondo claro (README en tema claro de GitHub) |

Uso:

- **Header:** `icon-clapper.png` (32 px de alto) + texto HTML "Cine**Box**" en Poppins 700, con "Box" en `--color-gold`. Es nítido a cualquier tamaño, accesible y evita un detalle del render (la "e" toca la "B" en el PNG).
- **Login y pantallas vacías:** `logo-cinebox-dark-bg.png` (alto 56–72 px, `alt="CineBox"`).
- **Favicon:** el ícono cuadrado (claqueta dentro del cuadro con borde dorado), que se lee en pestañas claras y oscuras.
- El ícono cuadrado no se usa en el header: compite con el wordmark.

## 3. Tipografía

- Títulos y wordmark: **Poppins** 600/700 (Google Fonts).
- Texto e interfaz: **Inter** 400/500/600.
- Escala: 12 · 14 · 16 · 20 · 24 · 32 · 44 (hero).

## 4. Layout

| Ancho | Navegación |
|---|---|
| Mobile (< 768 px) | Header con logo y campana; **barra inferior fija**: Inicio · Buscar · Qué veo · Comunidad · Perfil |
| Desktop | Barra superior: logo · Inicio · Descubrir · ¿Qué veo hoy? · Comunidad · buscador · avatar con nivel |

Contenedor máximo de 1280 px. Carruseles horizontales con scroll y snap en mobile, y flechas en desktop.

## 5. Componentes

- **Botón primario:** dorado con texto negro, radio de 10 px. **Secundario:** borde `--color-border` sobre fondo translúcido.
- **Chip:** pill; activo = dorado lleno.
- **Póster:** 2:3, radio de 10 px, badge de puntaje arriba a la derecha (★ dorado sobre negro al 75 %) y badge "SERIE" arriba a la izquierda.
- **Estrellas:** 5 con medias (0,5); interactivas en el detalle y en el modo deslizar.
- **Sección:** título con barra vertical dorada a la izquierda y "Ver todo →" en dorado.
- **Modal:** el del TP2, con el tema nuevo. Confirmación con resumen del ítem, para diferenciar baja lógica ("Desactivar", ámbar) de física ("Eliminar definitivamente", rojo).
- **Estados:** skeletons al cargar, vacío con ícono y texto que dice qué hacer, y error con "Reintentar". Nunca un "No pudimos cargar…" sin salida.

## 6. Pantallas y referencias de Glynbox

Los números corresponden a `referencias/glynbox/NN.jpeg` del proyecto de Claude.

| Pantalla CineBox | Referencia | Qué tomamos | Qué mejoramos |
|---|---|---|---|
| Login / registro | 00-login | Tarjeta con pestañas, "o continuá con" | Email + Google + GitHub; errores visibles por campo |
| Inicio | 01, 03, 05, 07, 08 | Carrusel de destacadas, accesos a Deslizar y ¿Qué veo hoy?, secciones horizontales | Sin anuncios; "Tendencias" calculadas en CineBox |
| ¿Qué veo hoy? | 02, 06 | 4 preguntas con chips | Resultados que se pueden ir pasando, con "por qué te lo recomendamos" |
| Descubrir | 04 | Pestañas por tipo y filtros (plataforma, género, año, orden) | Paginación real (opcional de la consigna) |
| Modo deslizar | 22 | Póster grande con La vi / Me gusta / ★ / Para ver | Agregar "Pasar" explícito y una ayuda corta sobre para qué sirve |
| Buscar | 11 | Pestañas Todo / Películas / Series / Personas | Resultados locales + TMDB bajo demanda |
| Comunidad | 09, 10, 15 | Feed, Descubrir usuarios, Rankings | Que cargue: estados vacíos útiles |
| Perfil | 12, 13, 14, 20, 21 | Avatar, nivel con barra, contadores, pestañas, actividad reciente, menú (editar, ajustes, compartir, cerrar sesión) | **Sin favoritas fijadas**; redes sociales visibles |
| Ya vi / Para ver / Me gusta | 16, 17, 18, 19 | Grilla con puntaje y "Ver como carrusel" | Filtros por tipo y orden |
| Estadísticas | 23, 24 | Vistas por mes, gustos, extremos, nivel | Que **sí** calcule género, década, director, actor y horas |

## 7. Accesibilidad

`label` en cada input, `aria-invalid` y mensaje asociado, foco visible dorado, navegación con teclado en carruseles y modales (Escape cierra), `alt` en pósters con el título.
