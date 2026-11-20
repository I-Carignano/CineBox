import axios from "axios";

// Ruta relativa: mismo origen que el front, el navegador manda la cookie de sesión solo.
// En local la resuelve el proxy de Vite; en Render, el rewrite /api/* del Static Site.
// Nunca la URL del backend.
export const api = axios.create({
  baseURL: "/api",
});

// Forma de los errores del backend (SPEC §4.3): { success: false, error: { message, details? } }.
// `details` trae los errores por campo en los 400 de Zod (con `_general` para los que no son de un campo).
export type ApiErrorBody = {
  error?: { message?: string; details?: Record<string, string[]> };
};

// Los errores de RTK Query (unwrap) ya llegan como string: ver axiosBaseQuery en store/moviesApi.ts.
export const getErrorMessage = (err: unknown): string => {
  if (typeof err === "string") return err;
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    if (!err.response) return "No se pudo conectar con el servidor";
    return err.response.data?.error?.message ?? err.message;
  }
  return "Error desconocido";
};
