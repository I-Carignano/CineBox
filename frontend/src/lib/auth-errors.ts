// Better Auth devuelve los mensajes de error en inglés: acá se traducen por código.
// Si el código no está en la lista, se usa el mensaje genérico que pasa quien llama.
const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "El email o la contraseña no son correctos",
  INVALID_EMAIL: "El email no es válido",
  INVALID_PASSWORD: "La contraseña no es correcta",
  USER_ALREADY_EXISTS: "Ya existe una cuenta con ese email",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Ya existe una cuenta con ese email",
  PASSWORD_TOO_SHORT: "La contraseña debe tener al menos 8 caracteres",
  PASSWORD_TOO_LONG: "La contraseña es demasiado larga",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "Esa cuenta ya está vinculada",
  BANNED_USER: "Tu cuenta fue dada de baja. Contactá a un administrador.",
  // Gestión de usuarios (/admin/usuarios): los aplica Better Auth según el rol.
  YOU_ARE_NOT_ALLOWED_TO_CHANGE_USERS_ROLE: "No tenés permisos para cambiar roles",
  YOU_ARE_NOT_ALLOWED_TO_BAN_USERS: "No tenés permisos para dar de baja usuarios",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_USERS: "No tenés permisos para eliminar usuarios",
  YOU_ARE_NOT_ALLOWED_TO_LIST_USERS: "No tenés permisos para ver los usuarios",
  YOU_CANNOT_BAN_YOURSELF: "No podés darte de baja a vos mismo",
  YOU_CANNOT_REMOVE_YOURSELF: "No podés eliminarte a vos mismo",
  // Del hook lib/user-management-guard.ts del backend.
  CANNOT_MANAGE_ADMINS: "Un administrador solo puede gestionar usuarios con rol usuario",
  CANNOT_CHANGE_OWN_ROLE: "No podés cambiarte el rol a vos mismo",
  ADMIN_CAN_ONLY_PROMOTE_TO_ADMIN: "Un administrador solo puede ascender usuarios a administrador",
  USERNAME_IS_ALREADY_TAKEN: "Ese nombre de usuario ya está en uso",
  INVALID_USERNAME: "El nombre de usuario no es válido (letras, números, guion bajo y punto)",
  USERNAME_TOO_SHORT: "El nombre de usuario debe tener al menos 3 caracteres",
  USERNAME_TOO_LONG: "El nombre de usuario admite hasta 30 caracteres",
};

// Errores que corresponden al campo "nombre de usuario" (se muestran bajo ese campo, no arriba).
const USERNAME_CODES = [
  "USERNAME_IS_ALREADY_TAKEN",
  "INVALID_USERNAME",
  "USERNAME_TOO_SHORT",
  "USERNAME_TOO_LONG",
];
export const isUsernameError = (error: { code?: string }): boolean =>
  !!error.code && USERNAME_CODES.includes(error.code);

export const authErrorMessage = (error: { code?: string }, fallback: string): string =>
  (error.code && MESSAGES[error.code]) || fallback;
