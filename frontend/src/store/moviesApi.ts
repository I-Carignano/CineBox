// RTK Query: estado del SERVIDOR. Cada endpoint genera un hook con caché incluida.
// Una sola API para todo /api (así lo recomienda RTK Query). Las mutations de películas se agregan en F8.
import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig } from "axios";
import { api as http, getErrorMessage } from "../lib/api";
import type { AuthProviders } from "../types/auth";
import type { Movie, MovieFilters, Paginated } from "../types/movie";

// Usa la misma instancia de axios (baseURL "/api"). El error se guarda ya como string, listo para mostrar.
const axiosBaseQuery: BaseQueryFn<AxiosRequestConfig, unknown, string> = async (config) => {
  try {
    const { data } = await http.request(config);
    return { data };
  } catch (err) {
    return { error: getErrorMessage(err) };
  }
};

export const moviesApi = createApi({
  reducerPath: "moviesApi",
  baseQuery: axiosBaseQuery,
  // Las queries "proveen" el tag y las mutations lo "invalidan" -> RTK Query vuelve a pedir solo.
  tagTypes: ["Movies"],
  endpoints: (build) => ({
    // Qué login social está habilitado (Google es opcional): decide si Login muestra su botón.
    getAuthProviders: build.query<AuthProviders, void>({
      query: () => ({ url: "/config" }),
    }),
    // Los filtros son el argumento: cada combinación queda en su propia entrada de caché.
    // axios omite los params undefined, así que solo viajan los filtros que están puestos.
    getMovies: build.query<Paginated<Movie>, MovieFilters>({
      query: (filters) => ({ url: "/peliculas", params: filters }),
      providesTags: ["Movies"],
    }),
    // GET /peliculas/:id devuelve la película sin envelope (400 si el id es inválido, 404 si no existe).
    getMovieById: build.query<Movie, string>({
      query: (id) => ({ url: `/peliculas/${id}` }),
      providesTags: ["Movies"],
    }),
  }),
});

export const { useGetAuthProvidersQuery, useGetMoviesQuery, useGetMovieByIdQuery } = moviesApi;
