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
};

export const authErrorMessage = (error: { code?: string }, fallback: string): string =>
  (error.code && MESSAGES[error.code]) || fallback;
