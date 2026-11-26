// Schemas de Zod de películas: crear, editar y los filtros del listado (por query string y por body).
// Mensajes en español con el locale `es` de Zod. El front espeja estas mismas reglas.
import { z } from "zod";

z.config(z.locales.es());

export const GENRES = [
  "accion",
  "aventura",
  "animacion",
  "ciencia_ficcion",
  "comedia",
  "documental",
  "drama",
  "fantasia",
  "romance",
  "suspenso",
  "terror",
] as const;
export type Genre = (typeof GENRES)[number];

export const SORT_FIELDS = ["createdAt", "title", "releaseDate", "rating", "durationMinutes"] as const;

// Estado de baja lógica para el listado (DF27). Solo lo puede pedir un admin; sin él, "activas".
export const MOVIE_STATUSES = ["activas", "inactivas", "todas"] as const;
export type MovieStatus = (typeof MOVIE_STATUSES)[number];

const MAX_FUTURE_YEARS = 5;

// Mensaje de tipo: "falta" si no vino el campo, "tiene que ser <tipo>" si vino otra cosa.
const typeError = (label: string, kind: string, required = "obligatorio") => (issue: { input?: unknown }) =>
  issue.input === undefined ? `${label} es ${required}` : `${label} tiene que ser ${kind}`;

// Mensaje para un campo que el schema no conoce (ej: createdBy). Devolver undefined deja el mensaje por defecto.
const unknownFieldError = (issue: { code: string; keys?: string[] }) =>
  issue.code === "unrecognized_keys" ? `Campo no permitido: ${(issue.keys ?? []).join(", ")}` : undefined;

// Sin ningún .default(): en Zod 4 un default se aplicaría también dentro de .partial() (PATCH)
// y pisaría el valor guardado. El default de `available` vive en el modelo de Mongoose.
// strictObject: un campo desconocido (ej: createdBy) se rechaza con 400.
export const createMovieSchema = z.strictObject(
  {
    title: z
      .string({ error: typeError("El título", "texto") })
      .trim()
      .min(1, "El título es obligatorio")
      .max(150, "El título admite hasta 150 caracteres"),
    director: z
      .string({ error: typeError("El director", "texto") })
      .trim()
      .min(1, "El director es obligatorio")
      .max(100, "El director admite hasta 100 caracteres"),
    genre: z.enum(GENRES, { error: "El género es obligatorio y tiene que ser uno de la lista" }),
    durationMinutes: z
      .number({ error: typeError("La duración", "un número", "obligatoria") })
      .int("La duración debe ser un número entero")
      .min(1, "La duración mínima es 1 minuto")
      .max(600, "La duración máxima es 600 minutos"),
    releaseDate: z.iso
      .date({ error: typeError("La fecha de estreno", "una fecha AAAA-MM-DD", "obligatoria") })
      .refine((value) => {
        const limit = new Date();
        limit.setFullYear(limit.getFullYear() + MAX_FUTURE_YEARS);
        return new Date(value) <= limit;
      }, `La fecha de estreno no puede superar los ${MAX_FUTURE_YEARS} años a futuro`),
    rating: z
      .number({ error: typeError("El rating", "un número") })
      .min(0, "El rating mínimo es 0")
      .max(10, "El rating máximo es 10")
      .refine((value) => Number.isInteger(Math.round(value * 10 * 1e6) / 1e6), "El rating admite un solo decimal"),
    available: z.boolean().optional(),
    synopsis: z.string().trim().max(1000, "La sinopsis admite hasta 1000 caracteres").optional(),
    posterUrl: z.url("La URL del póster no es válida").optional(),
  },
  { error: unknownFieldError }
);

export const updateMovieSchema = createMovieSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, { error: "Hay que mandar al menos un campo" });

// Campos comunes del listado que no cambian entre GET (query string) y QUERY (body).
const sortFields = {
  sortBy: z.enum(SORT_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().trim().min(1).max(100).optional(),
  genre: z.enum(GENRES).optional(),
  // Sin default acá: el service decide (activas para todos; el admin puede pedir inactivas o todas).
  estado: z.enum(MOVIE_STATUSES).optional(),
};

// GET /api/peliculas: todo llega como string, así que se coerciona.
// z.object (no strict): un parámetro desconocido, como el `mine` del TP2, se ignora (200 sin filtrar), no da 400.
export const listMoviesQuerySchema = z.object({
  ...sortFields,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  minRating: z.coerce.number().min(0).max(10).optional(),
  available: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
});

// QUERY /api/peliculas: mismos filtros pero en el body JSON, con tipos nativos.
export const listMoviesBodySchema = z.object({
  ...sortFields,
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(12),
  minRating: z.number().min(0).max(10).optional(),
  available: z.boolean().optional(),
});

// DELETE /api/peliculas/:id?permanente=true → baja física; sin el parámetro (o con false) → baja lógica (DF27).
export const deleteMovieQuerySchema = z.object({
  permanente: z
    .enum(["true", "false"], { error: "permanente tiene que ser true o false" })
    .transform((value) => value === "true")
    .optional(),
});

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;
export type ListMoviesInput = z.infer<typeof listMoviesBodySchema>;
export type DeleteMovieQuery = z.infer<typeof deleteMovieQuerySchema>;
