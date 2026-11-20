// Regla del dueño (P03): el admin puede modificar cualquier película; el user, solo las que creó.
import type { IMovie } from "../models/Movie.js";
import type { SessionUser } from "../types/auth.types.js";

export function canModifyMovie(user: SessionUser, movie: Pick<IMovie, "createdBy">): boolean {
  return user.role === "admin" || movie.createdBy === user.id;
}
