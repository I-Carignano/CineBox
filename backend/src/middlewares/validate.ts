// Middlewares genéricos: validan el body o la query string contra cualquier schema de Zod.
// Si falla, responden 400 con el formato único de error y los errores por campo en `details`.
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { sendError, zodDetails } from "../lib/http-errors.js";

export function validateBody(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // En Express 5 req.body es undefined si no vino body: se trata como objeto vacío.
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      sendError(res, 400, "Los datos enviados no son válidos", zodDetails(result.error));
      return;
    }

    // Reemplaza el body por la versión parseada (tipos ya coercionados).
    req.body = result.data;
    next();
  };
}

// En Express 5 req.query es de solo lectura (un getter), no se puede reasignar:
// la query validada se guarda en res.locals.query y el controller la lee de ahí.
export function validateQuery(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      sendError(res, 400, "Los datos enviados no son válidos", zodDetails(result.error));
      return;
    }

    res.locals.query = result.data;
    next();
  };
}
