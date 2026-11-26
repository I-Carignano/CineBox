// Controller = capa HTTP: lee req, llama al service, traduce el resultado a status + JSON.
// Sin try/catch: Express 5 manda los errores de los handlers async al errorHandler central (500 genérico).
import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import * as moviesService from "../services/movies.service.js";
import { sendError } from "../lib/http-errors.js";
import { isAdmin } from "../lib/roles.js";
import { CreateMovieInput, DeleteMovieQuery, ListMoviesInput, UpdateMovieInput } from "../schemas/movie.schema.js";
import { IMovieDocument } from "../models/Movie.js";

// GET /api/peliculas?page=1&search=...: la query ya viene validada en res.locals.query.
// ?estado=inactivas|todas solo lo respeta el service si quien pide es admin (req.user lo carga optionalAuth).
export async function listMovies(req: Request, res: Response): Promise<void> {
  res.status(200).json(await moviesService.listMovies(res.locals.query as ListMoviesInput, isAdmin(req.user)));
}

// QUERY /api/peliculas: los mismos filtros pero en el body JSON, ya validado por validateBody.
export async function listMoviesByBody(req: Request<{}, {}, ListMoviesInput>, res: Response): Promise<void> {
  res.status(200).json(await moviesService.listMovies(req.body, isAdmin(req.user)));
}

// Busca la película por id y responde 400 (id mal formado) o 404 (no existe) si corresponde.
// includeInactive: si es false, una película dada de baja también da 404 (lo público no la ve).
// El permiso de escritura (solo admin) ya lo resolvió requireRole en la ruta: acá no se mira el dueño.
// Devuelve null cuando ya respondió el error.
async function findOrReply(id: string, res: Response, includeInactive: boolean): Promise<IMovieDocument | null> {
  if (!isValidObjectId(id)) {
    sendError(res, 400, "El id no es válido");
    return null;
  }

  const movie = await moviesService.findMovieById(id, includeInactive);
  if (!movie) {
    sendError(res, 404, "Película no encontrada");
    return null;
  }

  return movie;
}

// El admin ve también el detalle de una dada de baja; el público y el user reciben 404.
export async function getMovieById(req: Request<{ id: string }>, res: Response): Promise<void> {
  const movie = await findOrReply(req.params.id, res, isAdmin(req.user));
  if (movie) res.status(200).json(await moviesService.getMovieWithAuthor(movie));
}

export async function createMovie(req: Request<{}, {}, CreateMovieInput>, res: Response): Promise<void> {
  // authMiddleware ya garantiza req.user; createdBy (quién la cargó) lo pone el server, nunca viene en el body.
  const movie = await moviesService.createMovie(req.body, req.user!.id);
  res.status(201).json(movie);
}

// Las rutas de escritura son solo de admin (requireRole): buscan incluyendo las inactivas (includeInactive = true).
export async function replaceMovie(req: Request<{ id: string }, {}, CreateMovieInput>, res: Response): Promise<void> {
  const movie = await findOrReply(req.params.id, res, true);
  if (!movie) return;

  res.status(200).json(await moviesService.replaceMovie(movie, req.body));
}

export async function updateMovie(req: Request<{ id: string }, {}, UpdateMovieInput>, res: Response): Promise<void> {
  const movie = await findOrReply(req.params.id, res, true);
  if (!movie) return;

  res.status(200).json(await moviesService.updateMovie(movie, req.body));
}

// DELETE /api/peliculas/:id → baja lógica (200 con la película; si ya estaba inactiva, igual 200).
// DELETE /api/peliculas/:id?permanente=true → baja física (204), también sobre una inactiva.
export async function deleteMovie(req: Request<{ id: string }>, res: Response): Promise<void> {
  const movie = await findOrReply(req.params.id, res, true);
  if (!movie) return;

  const { permanente } = res.locals.query as DeleteMovieQuery;
  if (permanente) {
    await moviesService.deleteMovie(movie);
    res.status(204).send();
    return;
  }

  res.status(200).json(await moviesService.deactivateMovie(movie));
}

// PATCH /api/peliculas/:id/restaurar → deshace la baja lógica (200; si ya estaba activa, igual 200).
export async function restoreMovie(req: Request<{ id: string }>, res: Response): Promise<void> {
  const movie = await findOrReply(req.params.id, res, true);
  if (!movie) return;

  res.status(200).json(await moviesService.restoreMovie(movie));
}
