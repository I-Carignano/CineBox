// ABM de películas: tabla con editar/eliminar; el formulario de alta/edición y la confirmación de borrado
// se abren en modales. Lo comparten dos pantallas:
//   scope="mine" -> /mis-peliculas: solo las películas del usuario logueado (mine=true).
//   scope="all"  -> /admin: todas las películas, con un filtro "Solo mis películas".
// El backend decide los permisos (el user solo toca lo suyo); acá solo se muestran las acciones.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useMovieFilters } from "../hooks/useMovieFilters";
import { getErrorMessage } from "../lib/api";
import { useSession } from "../lib/auth-client";
import { formatAuthor, formatDate, formatDuration, formatYear } from "../lib/format";
import { GENRE_LABELS } from "../lib/movies";
import { toMoviePayload, type MovieFormValues } from "../schemas/movie.schema";
import {
  useCreateMovieMutation,
  useDeleteMovieMutation,
  useGetMoviesQuery,
  useUpdateMovieMutation,
} from "../store/moviesApi";
import type { Movie } from "../types/movie";
import { ConfirmDialog } from "./ConfirmDialog";
import { Modal } from "./Modal";
import { MovieFilters } from "./MovieFilters";
import { MovieForm } from "./MovieForm";
import { Pagination } from "./Pagination";

interface MovieManagerProps {
  scope: "mine" | "all";
}

export const MovieManager = ({ scope }: MovieManagerProps) => {
  const isAdminPanel = scope === "all";
  const { data: session } = useSession();
  // En el panel de admin ?mine=true es un filtro más (checkbox); en /mis-peliculas siempre va fijo.
  const { filters, setFilters, clearFilters, hasActiveFilters } = useMovieFilters(isAdminPanel);
  const query = scope === "mine" ? { ...filters, mine: true } : filters;
  const { data, isLoading, isFetching, error, refetch } = useGetMoviesQuery(query);
  const [createMovie] = useCreateMovieMutation();
  const [updateMovie] = useUpdateMovieMutation();
  const [deleteMovie, { isLoading: isDeleting }] = useDeleteMovieMutation();

  // Estado de UI de esta pantalla: no es global, se queda en useState.
  // editing: el formulario está abierto en un modal (película nueva o existente).
  const [editing, setEditing] = useState<Movie | "new" | null>(null);
  // deleting: la película que se está por eliminar (confirmación en un modal).
  const [deleting, setDeleting] = useState<Movie | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Si se borró lo último de la última página, la página actual quedó vacía: volver a la última que tenga datos.
  useEffect(() => {
    if (data && data.data.length === 0 && data.meta.total > 0 && filters.page > 1) {
      setFilters({ page: data.meta.totalPages });
    }
    // Solo reacciona a datos nuevos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const movies = data?.data ?? [];

  const openForm = (target: Movie | "new") => {
    setNotice(null);
    setActionError(null);
    setEditing(target);
  };

  // unwrap() lanza si el backend responde error: MovieForm lo atrapa y lo muestra en el formulario.
  const handleSave = async (values: MovieFormValues) => {
    const payload = toMoviePayload(values);
    if (editing && editing !== "new") {
      await updateMovie({ id: editing._id, data: payload }).unwrap();
      setNotice(`"${values.title}" se actualizó.`);
    } else {
      await createMovie(payload).unwrap();
      setNotice(`"${values.title}" se creó.`);
    }
    setEditing(null);
  };

  // Se llama desde el botón "Sí, eliminar" del modal: al terminar (bien o mal) el modal se cierra.
  const handleDelete = async (movie: Movie) => {
    setActionError(null);
    const result = await deleteMovie(movie._id);
    setDeleting(null);
    if (result.error) {
      setActionError(`No se pudo eliminar "${movie.title}": ${getErrorMessage(result.error)}`);
      return;
    }
    setNotice(`"${movie.title}" se eliminó.`);
  };

  // "Vos" si la película es mía; si no, @username (o el name, o "—").
  const authorOf = (movie: Movie): string =>
    movie.createdBy === session?.user.id ? "Vos" : formatAuthor(movie.author);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold">
          {isAdminPanel ? "Administrar películas" : "Mis películas"}
        </h2>
        <button
          type="button"
          onClick={() => openForm("new")}
          className="rounded bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-700"
        >
          + Nueva película
        </button>
      </div>

      {notice && (
        <p role="status" className="rounded bg-green-50 p-3 text-sm text-green-800">
          {notice}
        </p>
      )}

      <MovieFilters
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onChange={setFilters}
        onClear={clearFilters}
      />

      {isAdminPanel && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={!!filters.mine}
            onChange={(event) => setFilters({ mine: event.target.checked || undefined })}
          />
          Solo mis películas
        </label>
      )}

      {actionError && (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">
          {actionError}
        </p>
      )}

      {error && (
        <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">
          No se pudieron cargar las películas: {getErrorMessage(error)}{" "}
          <button type="button" onClick={refetch} className="font-medium underline">
            Reintentar
          </button>
        </div>
      )}

      {isLoading && (
        <p role="status" className="text-slate-600">
          Cargando películas...
        </p>
      )}

      {data && movies.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-600">
            {hasActiveFilters || filters.page > 1
              ? "No hay películas que coincidan con tu búsqueda."
              : isAdminPanel
                ? "Todavía no hay películas cargadas."
                : "Todavía no cargaste ninguna película."}
          </p>
          {hasActiveFilters || filters.page > 1 ? (
            <button type="button" onClick={clearFilters} className="mt-2 text-brand-600 underline">
              Limpiar filtros
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openForm("new")}
              className="mt-2 text-brand-600 underline"
            >
              Crear la primera
            </button>
          )}
        </div>
      )}

      {data && movies.length > 0 && (
        <>
          <p role="status" className="text-sm text-slate-600">
            {data.meta.total} {data.meta.total === 1 ? "película" : "películas"}
          </p>
          <div
            className={`overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm transition-opacity ${isFetching ? "opacity-50" : ""}`}
          >
            <table className="w-full min-w-xl text-left text-sm">
              <caption className="sr-only">
                {isAdminPanel ? "Todas las películas" : "Tus películas"}
              </caption>
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Título
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Género
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Año
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Rating
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Estado
                  </th>
                  {isAdminPanel && (
                    <th scope="col" className="px-3 py-2 font-medium">
                      Autor
                    </th>
                  )}
                  <th scope="col" className="px-3 py-2 font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movies.map((movie) => (
                  <tr key={movie._id}>
                    <td className="px-3 py-2 font-medium">
                      <Link to={`/peliculas/${movie._id}`} className="hover:underline">
                        {movie.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{GENRE_LABELS[movie.genre]}</td>
                    <td className="px-3 py-2">{formatYear(movie.releaseDate)}</td>
                    <td className="px-3 py-2">{movie.rating.toFixed(1)}</td>
                    <td
                      className={`px-3 py-2 ${movie.available ? "text-green-700" : "text-slate-500"}`}
                    >
                      {movie.available ? "Disponible" : "No disponible"}
                    </td>
                    {isAdminPanel && <td className="px-3 py-2">{authorOf(movie)}</td>}
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openForm(movie)}
                          aria-label={`Editar ${movie.title}`}
                          className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-100"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNotice(null);
                            setActionError(null);
                            setDeleting(movie);
                          }}
                          aria-label={`Eliminar ${movie.title}`}
                          className="rounded border border-red-300 px-2 py-1 text-red-700 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onChange={(page) => setFilters({ page })}
          />
        </>
      )}

      {/* Crear / editar: el formulario vive en un modal. "Cancelar" o Escape cierran sin guardar. */}
      {editing && (
        <Modal
          title={editing === "new" ? "Nueva película" : `Editando "${editing.title}"`}
          onClose={() => setEditing(null)}
          size="lg"
        >
          <MovieForm
            movie={editing === "new" ? null : editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Eliminar película"
          message="¿Estás seguro de que querés eliminar esta película?"
          summary={[
            { label: "Título", value: deleting.title },
            { label: "Director", value: deleting.director },
            { label: "Género", value: GENRE_LABELS[deleting.genre] },
            { label: "Estreno", value: formatDate(deleting.releaseDate) },
            { label: "Duración", value: formatDuration(deleting.durationMinutes) },
            { label: "Rating", value: deleting.rating.toFixed(1) },
            { label: "Autor", value: authorOf(deleting) },
          ]}
          confirmLabel="Sí, eliminar"
          busyLabel="Eliminando..."
          danger
          busy={isDeleting}
          onConfirm={() => handleDelete(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </section>
  );
};
