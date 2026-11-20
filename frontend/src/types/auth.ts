// Roles del plugin admin de Better Auth.
export type UserRole = "superadmin" | "admin" | "user";

// Respuesta de GET /api/config: qué login social está habilitado en el backend.
export type AuthProviders = { googleEnabled: boolean };
