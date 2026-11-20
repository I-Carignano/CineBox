// Mapeo entre (método HTTP + ruta) y controller. Sin lógica de negocio acá.
// Lectura pública; escritura para user y admin (authMiddleware primero, después el rol, después la validación).
import { Router } from "express";
import {
  listMovies,
  listMoviesByBody,
  getMovieById,
  createMovie,
  replaceMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movies.controller.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import { authMiddleware, optionalAuth, requireRole } from "../middlewares/auth.middleware.js";
import {
  createMovieSchema,
  updateMovieSchema,
  listMoviesQuerySchema,
  listMoviesBodySchema,
} from "../schemas/movie.schema.js";

const router = Router();
// Cualquier usuario logueado puede escribir; el controller limita al user a sus propias películas (lib/ownership.ts).
const canWrite = [authMiddleware, requireRole("user", "admin")];

router.get("/", optionalAuth, validateQuery(listMoviesQuerySchema), listMovies);
// Extra (como el repo del profe): los mismos filtros en el body. QUERY es un método HTTP nuevo.
router.query!("/", optionalAuth, validateBody(listMoviesBodySchema), listMoviesByBody);
router.get("/:id", getMovieById);
router.post("/", canWrite, validateBody(createMovieSchema), createMovie);
router.put("/:id", canWrite, validateBody(createMovieSchema), replaceMovie);
router.patch("/:id", canWrite, validateBody(updateMovieSchema), updateMovie);
router.delete("/:id", canWrite, deleteMovie);

export default router;
