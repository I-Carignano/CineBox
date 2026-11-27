// RTK Query: estado del SERVIDOR. Cada endpoint genera un hook con caché incluida.
// Una sola API para todo /api (así lo recomienda RTK Query).
import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig } from "axios";
import { api as http, toApiError, type ApiError } from "../lib/api";
import type { AuthProviders } from "../types/auth";
import type { Movie, MovieFilters, MoviePayload, Paginated } from "../types/movie";

// Usa la misma instancia de axios (baseURL "/api"). El error se guarda como { status, message }: el mensaje
// listo para mostrar (getErrorMessage lo entiende) y el status para casos como el 404 del detalle.
const axiosBaseQuery: BaseQueryFn<AxiosRequestConfig, unknown, ApiError> = async (config) => {
  try {
    const { data } = await http.request(config);
    return { data };
  } catch (err) {
    return { error: toApiError(err) };
  }
};

export const moviesApi = createApi({
  reducerPath: "moviesApi",
  baseQuery: axiosBaseQuery,
  // Las queries "proveen" el tag y las mutations lo "invalidan" -> RTK Query vuelve a pedir solo.
  tagTypes: ["Movies"],
  endpoints: (build) => ({
    // Qué login social está habilitado (Google es opcional): decide si SocialLogin muestra su botón.
    getAuthProviders: build.query<AuthProviders, void>({
      query: () => ({ url: "/config" }),
    }),
    // Agrega email y contraseña a una cuenta social (POST /api/perfil/contrasena, 204 sin body).
    setPassword: build.mutation<void, { newPassword: string }>({
      query: (data) => ({ url: "/perfil/contrasena", method: "POST", data }),
    }),
    // Los filtros son el argumento: cada combinación queda en su propia entrada de caché.
    // axios omite los params undefined, así que solo viajan los filtros que están puestos.
    // `estado` (activas / inactivas / todas) solo lo respeta el backend si quien pide es admin.
    getMovies: build.query<Paginated<Movie>, MovieFilters>({
      query: (filters) => ({ url: "/peliculas", params: filters }),
      providesTags: ["Movies"],
    }),
    // GET /peliculas/:id devuelve la película sin envelope (400 si el id es inválido, 404 si no existe).
    getMovieById: build.query<Movie, string>({
      query: (id) => ({ url: `/peliculas/${id}` }),
      providesTags: ["Movies"],
    }),
    // Las mutations invalidan el tag "Movies": RTK Query vuelve a pedir los listados solo.
    createMovie: build.mutation<Movie, MoviePayload>({
      query: (data) => ({ url: "/peliculas", method: "POST", data }),
      invalidatesTags: ["Movies"],
    }),
    // PUT (objeto completo) y no PATCH: el formulario siempre manda todo, y con PUT se puede borrar
    // un póster o una sinopsis ya cargados (con PATCH un campo omitido significa "no tocar").
    updateMovie: build.mutation<Movie, { id: string; data: MoviePayload }>({
      query: ({ id, data }) => ({ url: `/peliculas/${id}`, method: "PUT", data }),
      invalidatesTags: ["Movies"],
    }),
    // Bajas (DF27). Las tres invalidan "Movies": se vuelven a pedir el panel (las dos pestañas), el catálogo
    // público y el detalle, así el cambio se ve solo en todas las pantallas.
    // DELETE /:id = baja lógica: la película se oculta de lo público y se puede restaurar (200 con la película).
    deleteMovie: build.mutation<Movie, string>({
      query: (id) => ({ url: `/peliculas/${id}`, method: "DELETE" }),
      invalidatesTags: ["Movies"],
    }),
    // DELETE /:id?permanente=true = baja física: se borra de la base para siempre (204 sin body).
    deleteMoviePermanently: build.mutation<void, string>({
      query: (id) => ({ url: `/peliculas/${id}`, method: "DELETE", params: { permanente: true } }),
      invalidatesTags: ["Movies"],
    }),
    // PATCH /:id/restaurar = deshace la baja lógica (200 con la película activa).
    restoreMovie: build.mutation<Movie, string>({
      query: (id) => ({ url: `/peliculas/${id}/restaurar`, method: "PATCH" }),
      invalidatesTags: ["Movies"],
    }),
  }),
});

export const {
  useGetAuthProvidersQuery,
  useGetMoviesQuery,
  useGetMovieByIdQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
  useDeleteMoviePermanentlyMutation,
  useRestoreMovieMutation,
  useSetPasswordMutation,
} = moviesApi;
