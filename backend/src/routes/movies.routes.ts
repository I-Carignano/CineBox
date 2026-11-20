// Mapeo entre (método HTTP + ruta) y controller. Sin lógica de negocio acá.
// Lectura pública; escritura solo para admin (authMiddleware primero, después el rol, después la validación).
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
const onlyAdmin = [authMiddleware, requireRole("admin")];

router.get("/", optionalAuth, validateQuery(listMoviesQuerySchema), listMovies);
// Extra (como el repo del profe): los mismos filtros en el body. QUERY es un método HTTP nuevo.
router.query!("/", optionalAuth, validateBody(listMoviesBodySchema), listMoviesByBody);
router.get("/:id", getMovieById);
router.post("/", onlyAdmin, validateBody(createMovieSchema), createMovie);
router.put("/:id", onlyAdmin, validateBody(createMovieSchema), replaceMovie);
router.patch("/:id", onlyAdmin, validateBody(updateMovieSchema), updateMovie);
router.delete("/:id", onlyAdmin, deleteMovie);

export default router;
