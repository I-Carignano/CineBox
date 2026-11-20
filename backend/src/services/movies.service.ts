// Capa de servicio: la lógica de negocio y el acceso a datos de películas, en UN solo lugar.
// No sabe nada de HTTP (req/res). Los ids llegan ya validados (isValidObjectId) por el controller.
// replace/update/delete reciben el documento ya buscado: así el controller puede chequear 404 y dueño antes.
import { QueryFilter } from "mongoose";
import Movie, { IMovieDocument } from "../models/Movie.js";
import { escapeRegex } from "../lib/escape-regex.js";
import { CreateMovieInput, ListMoviesInput, UpdateMovieInput } from "../schemas/movie.schema.js";
import { Paginated } from "../types/pagination.types.js";

// El filtro se arma campo por campo desde input ya validado por Zod: nunca se pasa el input crudo
// a Mongo (eso permitiría inyectar operadores como { "$gt": "" }).
function buildFilter(
  { search, genre, available, minRating, mine }: ListMoviesInput,
  userId?: string
): QueryFilter<IMovieDocument> {
  const filter: QueryFilter<IMovieDocument> = {};
  if (genre) filter.genre = genre;
  if (available !== undefined) filter.available = available;
  if (minRating !== undefined) filter.rating = { $gte: minRating };
  if (mine && userId) filter.createdBy = userId;
  if (search) {
    const safe = escapeRegex(search);
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { director: { $regex: safe, $options: "i" } },
    ];
  }
  return filter;
}

export async function listMovies(input: ListMoviesInput, userId?: string): Promise<Paginated<IMovieDocument>> {
  const { page, limit, sortBy, sortOrder } = input;
  const filter = buildFilter(input, userId);

  const [data, total] = await Promise.all([
    Movie.find(filter)
      // _id como desempate: si no, películas con el mismo rating/género podrían repetirse entre páginas.
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Movie.countDocuments(filter),
  ]);

  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export function findMovieById(id: string): Promise<IMovieDocument | null> {
  return Movie.findById(id);
}

export function createMovie(input: CreateMovieInput, createdBy: string): Promise<IMovieDocument> {
  return Movie.create({ ...input, createdBy });
}

// PUT: reemplazo completo. Lo opcional que no venga se borra (available vuelve a su default).
export function replaceMovie(movie: IMovieDocument, input: CreateMovieInput): Promise<IMovieDocument> {
  movie.set({ available: true, synopsis: undefined, posterUrl: undefined, ...input });
  return movie.save();
}

// PATCH: solo cambia los campos que vienen en el body.
export function updateMovie(movie: IMovieDocument, input: UpdateMovieInput): Promise<IMovieDocument> {
  movie.set(input);
  return movie.save();
}

export async function deleteMovie(movie: IMovieDocument): Promise<void> {
  await movie.deleteOne();
}
