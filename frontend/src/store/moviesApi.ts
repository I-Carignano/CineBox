// RTK Query: estado del SERVIDOR. Cada endpoint genera un hook con caché incluida.
// Una sola API para todo /api (así lo recomienda RTK Query). Los endpoints de películas se agregan en F7 y F8.
import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig } from "axios";
import { api as http, getErrorMessage } from "../lib/api";
import type { AuthProviders } from "../types/auth";

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
  }),
});

export const { useGetAuthProvidersQuery } = moviesApi;
