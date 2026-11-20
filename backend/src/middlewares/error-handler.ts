// Manejador central de errores (va al final de server.ts). Express 5 reenvía acá los errores de los
// controllers async. El detalle de un 500 se loguea en consola y nunca se manda al cliente.
import { Request, Response, NextFunction } from "express";
import { sendError } from "../lib/http-errors.js";

function hasType(error: unknown, type: string): boolean {
  return typeof error === "object" && error !== null && "type" in error && error.type === type;
}

// El cuarto parámetro (next) es lo que hace que Express lo reconozca como manejador de errores.
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // express.json() rechaza un body que no es JSON válido.
  if (hasType(error, "entity.parse.failed")) {
    sendError(res, 400, "El JSON enviado no es válido");
    return;
  }

  // Validación de Mongoose (Zod ya filtra casi todo antes, esto es un respaldo).
  if (error instanceof Error && error.name === "ValidationError") {
    sendError(res, 400, "Los datos enviados no son válidos");
    return;
  }

  console.error("[error] error inesperado:", error);
  sendError(res, 500, "Error interno del servidor");
}
