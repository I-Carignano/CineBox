// Rutas del perfil del usuario logueado: /api/perfil. Sin lógica de negocio acá.
import { Router } from "express";
import { setPassword } from "../controllers/profile.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.js";
import { setPasswordSchema } from "../schemas/profile.schema.js";

const router = Router();

// Cualquier usuario logueado (user, admin o superadmin) puede agregarse una contraseña a su propia cuenta.
router.post("/contrasena", authMiddleware, validateBody(setPasswordSchema), setPassword);

export default router;
