// Mapeo entre (método HTTP + ruta) y controller. Sin lógica de negocio acá.
// Lectura pública (solo activas; el admin ve también las dadas de baja); escritura solo para admin y superadmin (DF08):
// authMiddleware (401) → requireRole (403) → validación (400). Baja lógica, física y restaurar según DF27.
import { Router } from "express";
import {
  listMovies,
  listMoviesByBody,
  getMovieById,
  createMovie,
  replaceMovie,
  updateMovie,
  deleteMovie,
  restoreMovie,
} from "../controllers/movies.controller.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import { authMiddleware, optionalAuth, requireRole } from "../middlewares/auth.middleware.js";
import { ADMIN_ROLES } from "../lib/roles.js";
import {
  createMovieSchema,
  updateMovieSchema,
  listMoviesQuerySchema,
  listMoviesBodySchema,
  deleteMovieQuerySchema,
} from "../schemas/movie.schema.js";

const router = Router();
// El catálogo es del admin: un user logueado recibe 403 en cualquier escritura, sea quien sea el que la cargó.
const onlyAdmin = [authMiddleware, requireRole(...ADMIN_ROLES)];

// optionalAuth en las lecturas: sin sesión (o con user) se ven solo las activas; el admin puede pedir más.
router.get("/", optionalAuth, validateQuery(listMoviesQuerySchema), listMovies);
// Extra (como el repo del profe): los mismos filtros en el body. QUERY es un método HTTP nuevo.
router.query!("/", optionalAuth, validateBody(listMoviesBodySchema), listMoviesByBody);
router.get("/:id", optionalAuth, getMovieById);
router.post("/", onlyAdmin, validateBody(createMovieSchema), createMovie);
router.put("/:id", onlyAdmin, validateBody(createMovieSchema), replaceMovie);
router.patch("/:id", onlyAdmin, validateBody(updateMovieSchema), updateMovie);
// DELETE = baja lógica; DELETE ?permanente=true = baja física. PATCH /:id/restaurar deshace la baja lógica.
router.delete("/:id", onlyAdmin, validateQuery(deleteMovieQuerySchema), deleteMovie);
router.patch("/:id/restaurar", onlyAdmin, restoreMovie);

export default router;
