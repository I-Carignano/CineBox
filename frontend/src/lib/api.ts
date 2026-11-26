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

// Error de RTK Query (ver axiosBaseQuery en store/moviesApi.ts): el mensaje listo para mostrar y el status HTTP,
// para poder distinguir un 404 (ej.: el detalle de una película inexistente o dada de baja muestra el 404 de la app).
export type ApiError = { status?: number; message: string };

const isApiError = (err: unknown): err is ApiError =>
  typeof err === "object" && err !== null && typeof (err as { message?: unknown }).message === "string";

// El orden importa: un AxiosError también tiene `message` (en inglés), por eso se mira antes que ApiError.
export const getErrorMessage = (err: unknown): string => {
  if (typeof err === "string") return err;
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    if (!err.response) return "No se pudo conectar con el servidor";
    return err.response.data?.error?.message ?? err.message;
  }
  if (isApiError(err)) return err.message;
  return "Error desconocido";
};

export const getErrorStatus = (err: unknown): number | undefined =>
  isApiError(err) ? err.status : undefined;

export const toApiError = (err: unknown): ApiError => ({
  status: axios.isAxiosError(err) ? err.response?.status : undefined,
  message: getErrorMessage(err),
});
