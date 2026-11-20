// Formato único de error de toda la API (SPEC §4.3): { success: false, error: { message, details? } }.
// `details` solo se manda en los 400 de Zod, con los errores por campo.
import { Response } from "express";
import { z } from "zod";

// Errores de Zod por campo. Los que no son de un campo (ej: un campo desconocido como createdBy,
// o "hay que mandar al menos un campo") van bajo la clave `_general`.
export function zodDetails(error: z.ZodError): Record<string, string[]> {
  const { fieldErrors, formErrors } = z.flattenError(error);
  return formErrors.length > 0 ? { ...fieldErrors, _general: formErrors } : fieldErrors;
}

export function sendError(
  res: Response,
  status: number,
  message: string,
  details?: Record<string, string[]>
): void {
  res.status(status).json({
    success: false,
    error: details ? { message, details } : { message },
  });
}
