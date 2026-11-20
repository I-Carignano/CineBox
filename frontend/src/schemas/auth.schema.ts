// Schemas de Zod de login y registro (los usa React Hook Form con zodResolver).
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "El email no tiene un formato válido" }).trim().toLowerCase(),
  password: z.string().min(1, { error: "La contraseña es obligatoria" }),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { error: "El nombre debe tener al menos 2 caracteres" })
      .max(80, { error: "El nombre admite hasta 80 caracteres" }),
    email: z.email({ error: "El email no tiene un formato válido" }).trim().toLowerCase(),
    password: z.string().min(8, { error: "La contraseña debe tener al menos 8 caracteres" }),
    confirmPassword: z.string().min(1, { error: "Repetí la contraseña" }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
