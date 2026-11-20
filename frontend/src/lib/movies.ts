// Constantes de películas del lado del front (espejo de backend/src/schemas/movie.schema.ts).
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

export const GENRE_LABELS: Record<Genre, string> = {
  accion: "Acción",
  aventura: "Aventura",
  animacion: "Animación",
  ciencia_ficcion: "Ciencia ficción",
  comedia: "Comedia",
  documental: "Documental",
  drama: "Drama",
  fantasia: "Fantasía",
  romance: "Romance",
  suspenso: "Suspenso",
  terror: "Terror",
};

export const SORT_FIELDS = [
  "createdAt",
  "title",
  "releaseDate",
  "rating",
  "durationMinutes",
] as const;
export type SortField = (typeof SORT_FIELDS)[number];
export type SortOrder = "asc" | "desc";

// Opciones del select de orden: cada una combina campo y sentido ("campo:sentido").
export const SORT_OPTIONS: { value: `${SortField}:${SortOrder}`; label: string }[] = [
  { value: "createdAt:desc", label: "Más recientes en el catálogo" },
  { value: "title:asc", label: "Título (A-Z)" },
  { value: "title:desc", label: "Título (Z-A)" },
  { value: "rating:desc", label: "Mejor puntuadas" },
  { value: "releaseDate:desc", label: "Estreno más reciente" },
  { value: "releaseDate:asc", label: "Estreno más antiguo" },
  { value: "durationMinutes:desc", label: "Más largas" },
  { value: "durationMinutes:asc", label: "Más cortas" },
];

export const MIN_RATING_OPTIONS = [5, 6, 7, 8, 9];
