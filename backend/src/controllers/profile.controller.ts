// Controller del perfil del usuario logueado. Por ahora, una sola acción: agregar email y contraseña a una
// cuenta que se creó con GitHub o Google (así después puede entrar también con email y contraseña).
import { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { sendError } from "../lib/http-errors.js";
import { SetPasswordInput } from "../schemas/profile.schema.js";

// POST /api/perfil/contrasena: authMiddleware ya garantiza la sesión y validateBody el formato.
export async function setPassword(req: Request<{}, {}, SetPasswordInput>, res: Response): Promise<void> {
  // Better Auth identifica al usuario por la cookie de sesión, así que se le pasan los mismos headers.
  const headers = fromNodeHeaders(req.headers);

  // "credential" es la cuenta de email y contraseña de Better Auth. Si ya existe, no se pisa (para cambiarla
  // habría que pedir la contraseña actual, y eso no es parte de este flujo).
  const accounts = await auth.api.listUserAccounts({ headers });
  if (accounts.some((account) => account.providerId === "credential")) {
    sendError(res, 400, "Tu cuenta ya tiene email y contraseña");
    return;
  }

  await auth.api.setPassword({ body: { newPassword: req.body.newPassword }, headers });
  res.status(204).send();
}
