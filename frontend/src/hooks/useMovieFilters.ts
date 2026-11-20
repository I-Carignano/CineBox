// Los filtros del listado viven en la URL (?search=...&genre=...&page=2): se pueden compartir y sobreviven al F5.
// parseFilters sanea lo que venga en la URL (?page=abc, un género inventado) para no mandarle basura al backend.
import { useSearchParams } from "react-router";
import { GENRES, SORT_FIELDS } from "../lib/movies";
import type { MovieFilters } from "../types/movie";

const LIMIT = 12;
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_ORDER = "desc";

// allowMine: solo el panel de admin usa ?mine=true; en el catálogo público se ignora (mine exige sesión).
export const parseFilters = (params: URLSearchParams, allowMine = false): MovieFilters => {
  const page = Number(params.get("page"));
  const search = params.get("search")?.trim().slice(0, 100);
  const available = params.get("available");
  const minRatingRaw = params.get("minRating");
  const minRating = minRatingRaw ? Number(minRatingRaw) : NaN;

  return {
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    limit: LIMIT,
    search: search || undefined,
    genre: GENRES.find((genre) => genre === params.get("genre")),
    available: available === "true" ? true : available === "false" ? false : undefined,
    minRating: minRating >= 0 && minRating <= 10 ? minRating : undefined,
    sortBy: SORT_FIELDS.find((field) => field === params.get("sortBy")) ?? DEFAULT_SORT_BY,
    sortOrder: params.get("sortOrder") === "asc" ? "asc" : DEFAULT_SORT_ORDER,
    mine: allowMine && params.get("mine") === "true" ? true : undefined,
  };
};

// Solo se escriben en la URL los valores que NO son los de por defecto: queda corta y legible.
export const toSearchParams = (filters: MovieFilters): URLSearchParams => {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.genre) params.set("genre", filters.genre);
  if (filters.available !== undefined) params.set("available", String(filters.available));
  if (filters.minRating !== undefined) params.set("minRating", String(filters.minRating));
  if (filters.sortBy !== DEFAULT_SORT_BY) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder !== DEFAULT_SORT_ORDER) params.set("sortOrder", filters.sortOrder);
  if (filters.mine) params.set("mine", "true");
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
};

export const useMovieFilters = (allowMine = false) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseFilters(searchParams, allowMine);

  // Cualquier cambio de filtro vuelve a la página 1; solo cambiar la página la conserva.
  const setFilters = (changes: Partial<MovieFilters>) =>
    setSearchParams(toSearchParams({ ...filters, page: 1, ...changes }));

  const clearFilters = () => setSearchParams({});

  const hasActiveFilters =
    !!filters.search ||
    !!filters.genre ||
    filters.available !== undefined ||
    filters.minRating !== undefined ||
    !!filters.mine;

  return { filters, setFilters, clearFilters, hasActiveFilters };
};
