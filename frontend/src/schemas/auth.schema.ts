// Schemas de Zod de login, registro y edición de perfil (los usa React Hook Form con zodResolver).
// Regla de mensajes: un campo VACÍO dice "es obligatorio"; uno con texto mal escrito dice qué está mal.
import { z } from "zod";

// Texto obligatorio: si está vacío (o solo tiene espacios) corta ahí (abort) y muestra `required`, así no
// aparece además "debe tener al menos N caracteres". Se le encadenan las demás reglas del campo.
const requiredText = (required: string) =>
  z.string().trim().min(1, { error: required, abort: true });

// Email: vacío → "obligatorio"; con texto → recién ahí se valida el formato (pipe no sigue si ya falló).
const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { error: "El email es obligatorio" })
  .pipe(z.email({ error: "El email no tiene un formato válido" }));

// Contraseña nueva (registro y agregar contraseña). No se le hace trim: los espacios cuentan.
const newPassword = z
  .string()
  .min(1, { error: "La contraseña es obligatoria", abort: true })
  .min(8, { error: "La contraseña debe tener al menos 8 caracteres" });

// Mismas reglas que el plugin username() del backend (3 a 30, letras/números/_/.).
const username = requiredText("El nombre de usuario es obligatorio")
  .min(3, { error: "El nombre de usuario debe tener al menos 3 caracteres" })
  .max(30, { error: "El nombre de usuario admite hasta 30 caracteres" })
  .regex(/^[a-zA-Z0-9_.]+$/, {
    error: "Solo se permiten letras, números, guion bajo y punto",
  });

const firstName = requiredText("El nombre es obligatorio")
  .min(2, { error: "El nombre debe tener al menos 2 caracteres" })
  .max(40, { error: "El nombre admite hasta 40 caracteres" });

const lastName = requiredText("El apellido es obligatorio")
  .min(2, { error: "El apellido debe tener al menos 2 caracteres" })
  .max(40, { error: "El apellido admite hasta 40 caracteres" });

export const loginSchema = z.object({
  email,
  // En el login solo se pide que no esté vacía: la regla de 8 caracteres es del registro.
  password: z.string().min(1, { error: "La contraseña es obligatoria" }),
});

export const registerSchema = z
  .object({
    username,
    firstName,
    lastName,
    email,
    password: newPassword,
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
    newPassword,
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
