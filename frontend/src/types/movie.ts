// Misma forma que IMovie en el backend (backend/src/models/Movie.ts). El JSON no trae tipos: los declaramos a mano.
import type { Genre, SortField, SortOrder } from "../lib/movies";

export interface Movie {
  _id: string;
  title: string;
  director: string;
  genre: Genre;
  durationMinutes: number;
  releaseDate: string; // ISO completo: "1999-03-31T00:00:00.000Z"
  rating: number;
  available: boolean;
  synopsis?: string;
  posterUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Envelope de los listados paginados del backend: { data, meta }.
export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// Query params de GET /api/peliculas (SPEC §4.2).
export interface MovieFilters {
  page: number;
  limit: number;
  search?: string;
  genre?: Genre;
  available?: boolean;
  minRating?: number;
  sortBy: SortField;
  sortOrder: SortOrder;
  mine?: boolean;
}
