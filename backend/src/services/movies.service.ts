// Capa de servicio: la lógica de negocio y el acceso a datos de películas, en UN solo lugar.
// No sabe nada de HTTP (req/res). Los ids llegan ya validados (isValidObjectId) por el controller.
// replace/update/delete reciben el documento ya buscado: así el controller puede responder 400/404 antes.
import mongoose, { QueryFilter, Types } from "mongoose";
import Movie, { IMovie, IMovieDocument } from "../models/Movie.js";
import { escapeRegex } from "../lib/escape-regex.js";
import { CreateMovieInput, ListMoviesInput, UpdateMovieInput } from "../schemas/movie.schema.js";
import { Paginated } from "../types/pagination.types.js";

// Quién cargó la película: solo datos públicos (nunca el email). username es null si el usuario no tiene
// (entró con GitHub/Google); name es null si el usuario ya no existe. El front muestra username, si no name.
export interface MovieAuthor {
  id: string;
  username: string | null;
  name: string | null;
}

// La película tal como sale en GET lista, GET por id y QUERY.
export interface MovieWithAuthor extends IMovie {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  author: MovieAuthor;
}

// Los usuarios de Better Auth viven en la colección "user" (no hay modelo Mongoose: no es populate).
interface AuthorDoc {
  _id: Types.ObjectId | string;
  username?: string | null;
  name?: string | null;
}

// Agrega `author` a cada película con UNA sola consulta a la colección de usuarios (proyectando solo
// username y name), sin importar cuántas películas haya en la página.
async function withAuthors(movies: IMovieDocument[]): Promise<MovieWithAuthor[]> {
  const ids = [...new Set(movies.map((movie) => movie.createdBy))];
  // Better Auth puede guardar el _id como ObjectId o como string: se buscan las dos formas.
  const lookupIds = ids.flatMap((id) => (Types.ObjectId.isValid(id) ? [id, new Types.ObjectId(id)] : [id]));

  const authors = await mongoose.connection
    .collection<AuthorDoc>("user")
    .find({ _id: { $in: lookupIds } }, { projection: { username: 1, name: 1 } })
    .toArray();
  const byId = new Map(authors.map((author) => [String(author._id), author]));

  return movies.map((movie) => {
    const author = byId.get(movie.createdBy);
    return {
      ...(movie.toJSON() as Omit<MovieWithAuthor, "author">),
      author: { id: movie.createdBy, username: author?.username ?? null, name: author?.name ?? null },
    };
  });
}

// El filtro se arma campo por campo desde input ya validado por Zod: nunca se pasa el input crudo
// a Mongo (eso permitiría inyectar operadores como { "$gt": "" }).
// createdBy no se usa como filtro: es solo el dato de quién la cargó.
function buildFilter({ search, genre, available, minRating }: ListMoviesInput): QueryFilter<IMovieDocument> {
  const filter: QueryFilter<IMovieDocument> = {};
  if (genre) filter.genre = genre;
  if (available !== undefined) filter.available = available;
  if (minRating !== undefined) filter.rating = { $gte: minRating };
  if (search) {
    const safe = escapeRegex(search);
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { director: { $regex: safe, $options: "i" } },
    ];
  }
  return filter;
}

export async function listMovies(input: ListMoviesInput): Promise<Paginated<MovieWithAuthor>> {
  const { page, limit, sortBy, sortOrder } = input;
  const filter = buildFilter(input);

  const [data, total] = await Promise.all([
    Movie.find(filter)
      // _id como desempate: si no, películas con el mismo rating/género podrían repetirse entre páginas.
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Movie.countDocuments(filter),
  ]);

  return { data: await withAuthors(data), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export function findMovieById(id: string): Promise<IMovieDocument | null> {
  return Movie.findById(id);
}

// Para GET /:id: la película con su autor.
export async function getMovieWithAuthor(movie: IMovieDocument): Promise<MovieWithAuthor> {
  const [withAuthor] = await withAuthors([movie]);
  return withAuthor;
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
