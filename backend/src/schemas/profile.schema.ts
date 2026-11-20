// Schema de Zod del perfil: agregar una contraseña a una cuenta social (POST /api/perfil/contrasena).
import { z } from "zod";

// Mismas reglas que el registro (mínimo 8). El máximo (128) es el que impone Better Auth al hashear.
export const setPasswordSchema = z.strictObject({
  newPassword: z
    .string()
    .min(8, { error: "La contraseña debe tener al menos 8 caracteres" })
    .max(128, { error: "La contraseña admite hasta 128 caracteres" }),
});

export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
