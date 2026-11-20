// Tipos inferidos de la config de Better Auth (incluyen el `role` que agrega el plugin admin) y req.user de Express.
import type { auth } from "../lib/auth.js";

type Session = typeof auth.$Infer.Session;
export type SessionUser = Session["user"];
export type UserRole = "superadmin" | "admin" | "user";

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}
