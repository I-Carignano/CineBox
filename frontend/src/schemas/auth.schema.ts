// Schemas de Zod de login, registro y edición de perfil (los usa React Hook Form con zodResolver).
import { z } from "zod";

// Mismas reglas que el plugin username() del backend (3 a 30, letras/números/_/.).
const username = z
  .string()
  .trim()
  .min(3, { error: "El nombre de usuario debe tener al menos 3 caracteres" })
  .max(30, { error: "El nombre de usuario admite hasta 30 caracteres" })
  .regex(/^[a-zA-Z0-9_.]+$/, {
    error: "Solo se permiten letras, números, guion bajo y punto",
  });

const firstName = z
  .string()
  .trim()
  .min(2, { error: "El nombre debe tener al menos 2 caracteres" })
  .max(40, { error: "El nombre admite hasta 40 caracteres" });

const lastName = z
  .string()
  .trim()
  .min(2, { error: "El apellido debe tener al menos 2 caracteres" })
  .max(40, { error: "El apellido admite hasta 40 caracteres" });

export const loginSchema = z.object({
  email: z.email({ error: "El email no tiene un formato válido" }).trim().toLowerCase(),
  password: z.string().min(1, { error: "La contraseña es obligatoria" }),
});

export const registerSchema = z
  .object({
    username,
    firstName,
    lastName,
    email: z.email({ error: "El email no tiene un formato válido" }).trim().toLowerCase(),
    password: z.string().min(8, { error: "La contraseña debe tener al menos 8 caracteres" }),
    confirmPassword: z.string().min(1, { error: "Repetí la contraseña" }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Perfil: los mismos campos del registro, por partes. El email no se edita.
//   /completar-perfil: los tres juntos. /perfil: el lápiz del usuario y el lápiz del nombre, cada uno su modal.
export const profileSchema = z.object({ username, firstName, lastName });
export const usernameFormSchema = z.object({ username });
export const nameFormSchema = z.object({ firstName, lastName });

// Agregar email y contraseña a una cuenta social (misma regla de contraseña que el registro).
export const addPasswordSchema = z
  .object({
    newPassword: z.string().min(8, { error: "La contraseña debe tener al menos 8 caracteres" }),
    confirmPassword: z.string().min(1, { error: "Repetí la contraseña" }),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    error: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type UsernameFormValues = z.infer<typeof usernameFormSchema>;
export type NameFormValues = z.infer<typeof nameFormSchema>;
export type AddPasswordFormValues = z.infer<typeof addPasswordSchema>;
