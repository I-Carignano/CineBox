// Regla del dueño (P03): admin y superadmin pueden modificar cualquier película; el user, solo las que creó.
import type { IMovie } from "../models/Movie.js";
import type { SessionUser } from "../types/auth.types.js";

export function canModifyMovie(user: SessionUser, movie: Pick<IMovie, "createdBy">): boolean {
  return user.role === "admin" || user.role === "superadmin" || movie.createdBy === user.id;
}
