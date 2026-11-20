// Schema del formulario de películas. Espeja backend/src/schemas/movie.schema.ts (mismas reglas y mensajes).
// Los inputs de texto entregan strings, así que synopsis y posterUrl aceptan "" (vacío = no cargado).
import { z } from "zod";
import { GENRES } from "../lib/movies";
import type { Movie, MoviePayload } from "../types/movie";

const MAX_FUTURE_YEARS = 5;

export const movieSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio")
    .max(150, "El título admite hasta 150 caracteres"),
  director: z
    .string()
    .trim()
    .min(1, "El director es obligatorio")
    .max(100, "El director admite hasta 100 caracteres"),
  genre: z.enum(GENRES, { error: "Elegí un género" }),
  // valueAsNumber devuelve NaN si el input está vacío: el { error } cubre ese caso.
  durationMinutes: z
    .number({ error: "La duración es obligatoria y tiene que ser un número" })
    .int("La duración debe ser un número entero")
    .min(1, "La duración mínima es 1 minuto")
    .max(600, "La duración máxima es 600 minutos"),
  releaseDate: z.iso.date({ error: "La fecha de estreno es obligatoria" }).refine((value) => {
    const limit = new Date();
    limit.setFullYear(limit.getFullYear() + MAX_FUTURE_YEARS);
    const date = new Date(value);
    // Fecha inválida (ej: vacía): ya la reporta el formato, no repetir el error del tope.
    return Number.isNaN(date.getTime()) || date <= limit;
  }, `La fecha de estreno no puede superar los ${MAX_FUTURE_YEARS} años a futuro`),
  rating: z
    .number({ error: "El rating es obligatorio y tiene que ser un número" })
    .min(0, "El rating mínimo es 0")
    .max(10, "El rating máximo es 10")
    .refine(
      (value) => Number.isInteger(Math.round(value * 10 * 1e6) / 1e6),
      "El rating admite un solo decimal",
    ),
  available: z.boolean(),
  synopsis: z.string().trim().max(1000, "La sinopsis admite hasta 1000 caracteres"),
  posterUrl: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.url().safeParse(value).success,
      "La URL del póster no es válida",
    ),
});

export type MovieFormValues = z.infer<typeof movieSchema>;

export const emptyMovie: MovieFormValues = {
  title: "",
  director: "",
  // "" no es un género válido: obliga a elegir uno (el select arranca en "Elegí un género").
  genre: "" as MovieFormValues["genre"],
  durationMinutes: NaN,
  releaseDate: "",
  rating: NaN,
  available: true,
  synopsis: "",
  posterUrl: "",
};

// De la película guardada a los valores del formulario (la fecha del input es AAAA-MM-DD).
export const toMovieFormValues = (movie: Movie): MovieFormValues => ({
  title: movie.title,
  director: movie.director,
  genre: movie.genre,
  durationMinutes: movie.durationMinutes,
  releaseDate: movie.releaseDate.slice(0, 10),
  rating: movie.rating,
  available: movie.available,
  synopsis: movie.synopsis ?? "",
  posterUrl: movie.posterUrl ?? "",
});

// De los valores del formulario al body del PUT. El "" de synopsis/posterUrl se omite (el backend
// rechaza posterUrl "" y PUT borra lo opcional que no viene). Se arma campo por campo: el backend es
// estricto y rechaza cualquier campo de más.
export const toMoviePayload = (values: MovieFormValues): MoviePayload => ({
  title: values.title,
  director: values.director,
  genre: values.genre,
  durationMinutes: values.durationMinutes,
  releaseDate: values.releaseDate,
  rating: values.rating,
  available: values.available,
  synopsis: values.synopsis || undefined,
  posterUrl: values.posterUrl || undefined,
});
