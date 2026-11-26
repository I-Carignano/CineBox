// Protege rutas: Better Auth lee la cookie de sesión y la busca en Mongo.
// authMiddleware exige sesión (401) y requireRole exige rol (403).
// Errores con el formato único de la SPEC §4.3: { success: false, error: { message } }.
import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { UserRole } from "../types/auth.types.js";

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });

    if (!session) {
      res.status(401).json({ success: false, error: { message: "Sesión requerida" } });
      return;
    }

    req.user = session.user;
    next();
  } catch (error) {
    // El detalle va al log, nunca al cliente.
    console.error("[auth] error al leer la sesión:", error);
    res.status(500).json({ success: false, error: { message: "Error interno del servidor" } });
  }
}

// requireRole: se usa SIEMPRE después de authMiddleware, asume que req.user ya está seteado.
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: "Sesión requerida" } });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({ success: false, error: { message: "No tenés permisos para realizar esta acción" } });
      return;
    }

    next();
  };
}
