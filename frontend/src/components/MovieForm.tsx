// Formulario de alta y edición de películas (solo lo usa el panel /admin). Se muestra dentro de un Modal.
// Edición con `values` (no defaultValues): al elegir otra película, el formulario se rellena solo.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "../lib/api";
import { GENRES, GENRE_LABELS } from "../lib/movies";
import {
  emptyMovie,
  movieSchema,
  toMovieFormValues,
  type MovieFormValues,
} from "../schemas/movie.schema";
import type { Movie } from "../types/movie";
import { FormField } from "./FormField";
import { SelectField } from "./SelectField";
import { TextAreaField } from "./TextAreaField";

interface MovieFormProps {
  movie: Movie | null; // null = película nueva
  onSave: (values: MovieFormValues) => Promise<void>;
  onCancel: () => void;
}

export const MovieForm = ({ movie, onSave, onCancel }: MovieFormProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(movieSchema),
    values: movie ? toMovieFormValues(movie) : emptyMovie,
  });

  // Si guarda bien, el padre cierra el modal (y el formulario se desmonta). Si falla, el error queda a la vista.
  const onSubmit = async (values: MovieFormValues) => {
    try {
      await onSave(values);
    } catch (err) {
      // unwrap() de RTK Query lanza el error ya como string (ver axiosBaseQuery).
      setError("root.server", { message: getErrorMessage(err) });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label={movie ? `Editar ${movie.title}` : "Nueva película"}
      className="flex flex-col gap-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          label="Título"
          type="text"
          error={errors.title?.message}
          {...register("title")}
        />
        <FormField
          label="Director"
          type="text"
          error={errors.director?.message}
          {...register("director")}
        />
        <SelectField label="Género" error={errors.genre?.message} {...register("genre")}>
          <option value="">Elegí un género</option>
          {GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {GENRE_LABELS[genre]}
            </option>
          ))}
        </SelectField>
        <FormField
          label="Fecha de estreno"
          type="date"
          error={errors.releaseDate?.message}
          {...register("releaseDate")}
        />
        <FormField
          label="Duración (minutos)"
          type="number"
          inputMode="numeric"
          min={1}
          max={600}
          error={errors.durationMinutes?.message}
          {...register("durationMinutes", { valueAsNumber: true })}
        />
        <FormField
          label="Rating (0 a 10, un decimal)"
          type="number"
          inputMode="decimal"
          step="0.1"
          min={0}
          max={10}
          error={errors.rating?.message}
          {...register("rating", { valueAsNumber: true })}
        />
      </div>

      <FormField
        label="URL del póster (opcional)"
        type="url"
        inputMode="url"
        placeholder="https://..."
        error={errors.posterUrl?.message}
        {...register("posterUrl")}
      />
      <TextAreaField
        label="Sinopsis (opcional)"
        rows={4}
        error={errors.synopsis?.message}
        {...register("synopsis")}
      />

      <label className="flex items-center gap-2 text-sm text-text">
        <input type="checkbox" {...register("available")} />
        Disponible
      </label>

      {errors.root?.server && (
        <p role="alert" className="text-sm text-danger">
          {errors.root.server.message}
        </p>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded border border-border px-4 py-2 text-text transition hover:bg-surface-2 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-gold px-4 py-2 font-medium text-on-gold transition hover:bg-gold-hover disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : movie ? "Guardar cambios" : "Crear película"}
        </button>
      </div>
    </form>
  );
};
