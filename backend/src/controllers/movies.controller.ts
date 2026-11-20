// Controller = capa HTTP: lee req, llama al service, traduce el resultado a status + JSON.
// Sin try/catch: Express 5 manda los errores de los handlers async al errorHandler central (500 genérico).
import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import * as moviesService from "../services/movies.service.js";
import { sendError } from "../lib/http-errors.js";
import { canModifyMovie } from "../lib/ownership.js";
import { CreateMovieInput, ListMoviesInput, UpdateMovieInput } from "../schemas/movie.schema.js";
import { IMovieDocument } from "../models/Movie.js";

// Lista compartida por GET y QUERY: mine=true necesita sesión (la ruta usa optionalAuth).
async function respondList(filters: ListMoviesInput, req: Request, res: Response): Promise<void> {
  if (filters.mine && !req.user) {
    sendError(res, 401, "Sesión requerida");
    return;
  }

  res.status(200).json(await moviesService.listMovies(filters, req.user?.id));
}

// GET /api/peliculas?page=1&search=...: la query ya viene validada en res.locals.query.
export async function listMovies(req: Request, res: Response): Promise<void> {
  await respondList(res.locals.query as ListMoviesInput, req, res);
}

// QUERY /api/peliculas: los mismos filtros pero en el body JSON, ya validado por validateBody.
export async function listMoviesByBody(req: Request<{}, {}, ListMoviesInput>, res: Response): Promise<void> {
  await respondList(req.body, req, res);
}

// Busca la película por id y responde 400 (id mal formado) o 404 (no existe) si corresponde.
// Devuelve null cuando ya respondió el error.
async function findOrReply(id: string, res: Response): Promise<IMovieDocument | null> {
  if (!isValidObjectId(id)) {
    sendError(res, 400, "El id no es válido");
    return null;
  }

  const movie = await moviesService.findMovieById(id);
  if (!movie) {
    sendError(res, 404, "Película no encontrada");
    return null;
  }

  return movie;
}

// Para modificar (PUT/PATCH/DELETE): igual que findOrReply y además 403 si es un user sobre una película ajena.
// El orden importa: id inválido (400) -> no existe (404) -> sin permiso (403).
async function findOwnedOrReply(
  req: Request<{ id: string }>,
  res: Response
): Promise<IMovieDocument | null> {
  const movie = await findOrReply(req.params.id, res);
  if (!movie) return null;

  // authMiddleware ya garantiza req.user.
  if (!canModifyMovie(req.user!, movie)) {
    sendError(res, 403, "Solo podés modificar las películas que creaste");
    return null;
  }

  return movie;
}

export async function getMovieById(req: Request<{ id: string }>, res: Response): Promise<void> {
  const movie = await findOrReply(req.params.id, res);
  if (movie) res.status(200).json(await moviesService.getMovieWithAuthor(movie));
}

export async function createMovie(req: Request<{}, {}, CreateMovieInput>, res: Response): Promise<void> {
  // authMiddleware ya garantiza req.user; createdBy lo pone el server, nunca viene en el body.
  const movie = await moviesService.createMovie(req.body, req.user!.id);
  res.status(201).json(movie);
}

export async function replaceMovie(req: Request<{ id: string }, {}, CreateMovieInput>, res: Response): Promise<void> {
  const movie = await findOwnedOrReply(req, res);
  if (!movie) return;

  res.status(200).json(await moviesService.replaceMovie(movie, req.body));
}

export async function updateMovie(req: Request<{ id: string }, {}, UpdateMovieInput>, res: Response): Promise<void> {
  const movie = await findOwnedOrReply(req, res);
  if (!movie) return;

  res.status(200).json(await moviesService.updateMovie(movie, req.body));
}

export async function deleteMovie(req: Request<{ id: string }>, res: Response): Promise<void> {
  const movie = await findOwnedOrReply(req, res);
  if (!movie) return;

  await moviesService.deleteMovie(movie);
  res.status(204).send();
}
