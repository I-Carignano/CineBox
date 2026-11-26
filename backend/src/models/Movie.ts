// Modelo Mongoose de la entidad Movie (SPEC §3). Se expone en la API como /api/peliculas.
import { Schema, model, Document, Model, Types } from "mongoose";
import { GENRES, Genre } from "../schemas/movie.schema.js";

export interface IMovie {
  title: string;
  director: string;
  genre: Genre;
  durationMinutes: number;
  releaseDate: Date;
  rating: number;
  available: boolean;
  synopsis?: string;
  posterUrl?: string;
  createdBy: string; // id del usuario de Better Auth que la creó
  // Baja lógica (DF27): active=false + deletedAt. No confundir con `available` (si está disponible para ver).
  active: boolean;
  deletedAt: Date | null;
}

export interface IMovieDocument extends IMovie, Document {
  _id: Types.ObjectId;
}

const movieSchema = new Schema<IMovieDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 150, index: true },
    director: { type: String, required: true, trim: true, maxlength: 100 },
    genre: { type: String, required: true, enum: GENRES, index: true },
    durationMinutes: { type: Number, required: true, min: 1, max: 600 },
    releaseDate: { type: Date, required: true },
    rating: { type: Number, required: true, min: 0, max: 10 },
    // El default vive acá y no en Zod: así un PATCH parcial no pisa el valor existente.
    available: { type: Boolean, default: true },
    synopsis: { type: String, trim: true, maxlength: 1000 },
    posterUrl: { type: String, trim: true },
    createdBy: { type: String, required: true, index: true },
    // Baja lógica. Los documentos de antes de F1 no tienen el campo: Mongoose les pone el default al leerlos y
    // las consultas públicas usan { active: { $ne: false } }, así cuentan como activos sin migrar nada.
    active: { type: Boolean, default: true, index: true },
    deletedAt: { type: Date, default: null },
  },
  // versionKey: false oculta __v de las respuestas.
  { timestamps: true, versionKey: false }
);

const Movie: Model<IMovieDocument> = model<IMovieDocument>("Movie", movieSchema);

export default Movie;
