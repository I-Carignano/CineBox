// ABM de películas del panel de admin (/admin): tabla con acciones; el formulario de alta/edición y las
// confirmaciones se abren en modales. Es la ÚNICA pantalla con acciones de escritura sobre películas:
// el catálogo es del admin (DF08). La ruta ya exige rol admin/superadmin y el backend responde 403 a un user.
// Baja lógica y física (DF27): pestañas Activas / Inactivas (?estado= en la URL).
//   Activas:   Editar · Dar de baja (baja lógica, restaurable).
//   Inactivas: Restaurar · Eliminar definitivamente (baja física).
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useMovieFilters } from "../hooks/useMovieFilters";
import { getErrorMessage } from "../lib/api";
import { formatAuthor, formatDateTime, formatYear } from "../lib/format";
import { GENRE_LABELS } from "../lib/movies";
import { toMoviePayload, type MovieFormValues } from "../schemas/movie.schema";
import {
  useCreateMovieMutation,
  useDeleteMovieMutation,
  useDeleteMoviePermanentlyMutation,
  useGetMoviesQuery,
  useRestoreMovieMutation,
  useUpdateMovieMutation,
} from "../store/moviesApi";
import type { Movie } from "../types/movie";
import { Modal } from "./Modal";
import { MovieDeleteDialog, type MovieDeleteMode } from "./MovieDeleteDialog";
import { MovieFilters } from "./MovieFilters";
import { MovieForm } from "./MovieForm";
import { Pagination } from "./Pagination";

const tabClass = (active: boolean) =>
  `rounded-t px-4 py-2 text-sm font-medium transition ${
    active
      ? "border-b-2 border-gold text-gold"
      : "text-muted hover:bg-surface-2 hover:text-text"
  }`;

export const MovieManager = () => {
  // true: este panel sí lee ?estado= (el catálogo público no).
  const { filters, setFilters, clearFilters, hasActiveFilters } = useMovieFilters(true);
  const showingInactive = filters.estado === "inactivas";
  const { data, isLoading, isFetching, error, refetch } = useGetMoviesQuery(filters);
  const [createMovie] = useCreateMovieMutation();
  const [updateMovie] = useUpdateMovieMutation();
  const [deleteMovie, { isLoading: isSoftDeleting }] = useDeleteMovieMutation();
  const [deleteMoviePermanently, { isLoading: isPermanentDeleting }] = useDeleteMoviePermanentlyMutation();
  const [restoreMovie] = useRestoreMovieMutation();

  // Estado de UI de esta pantalla: no es global, se queda en useState.
  // editing: el formulario está abierto en un modal (película nueva o existente).
  const [editing, setEditing] = useState<Movie | "new" | null>(null);
  // deleting: la película que se está por dar de baja y con qué tipo de baja (cada una tiene su modal).
  const [deleting, setDeleting] = useState<{ movie: Movie; mode: MovieDeleteMode } | null>(null);
  // restoringId: la fila que se está restaurando (restaurar no pide confirmación: se puede volver a dar de baja).
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Si se sacó lo último de la última página, la página actual quedó vacía: volver a la última que tenga datos.
  useEffect(() => {
    if (data && data.data.length === 0 && data.meta.total > 0 && filters.page > 1) {
      setFilters({ page: data.meta.totalPages });
    }
    // Solo reacciona a datos nuevos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const movies = data?.data ?? [];

  const clearMessages = () => {
    setNotice(null);
    setActionError(null);
  };

  const openForm = (target: Movie | "new") => {
    clearMessages();
    setEditing(target);
  };

  const changeTab = (inactive: boolean) => {
    clearMessages();
    // undefined = "activas" (el default): la URL queda limpia. Cambiar de pestaña vuelve a la página 1.
    setFilters({ estado: inactive ? "inactivas" : undefined });
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

  // Se llama desde el botón de confirmar del modal: al terminar (bien o mal) el modal se cierra.
  // Los errores del backend llegan con su mensaje (ej.: 403 "No tenés permisos para realizar esta acción").
  const handleDelete = async ({ movie, mode }: { movie: Movie; mode: MovieDeleteMode }) => {
    clearMessages();
    const result =
      mode === "soft" ? await deleteMovie(movie._id) : await deleteMoviePermanently(movie._id);
    setDeleting(null);
    if (result.error) {
      const action = mode === "soft" ? "dar de baja" : "eliminar definitivamente";
      setActionError(`No se pudo ${action} "${movie.title}": ${getErrorMessage(result.error)}`);
      return;
    }
    setNotice(
      mode === "soft"
        ? `"${movie.title}" se dio de baja: ya no aparece en el catálogo. La podés restaurar desde Inactivas.`
        : `"${movie.title}" se eliminó definitivamente.`,
    );
  };

  const handleRestore = async (movie: Movie) => {
    clearMessages();
    setRestoringId(movie._id);
    const result = await restoreMovie(movie._id);
    setRestoringId(null);
    if (result.error) {
      setActionError(`No se pudo restaurar "${movie.title}": ${getErrorMessage(result.error)}`);
      return;
    }
    setNotice(`"${movie.title}" se restauró y volvió al catálogo.`);
  };

  const isFiltered = hasActiveFilters || filters.page > 1;
  const emptyMessage = isFiltered
    ? "No hay películas que coincidan con tu búsqueda."
    : showingInactive
      ? "No hay películas dadas de baja."
      : "Todavía no hay películas cargadas.";

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold">Administrar películas</h2>
        <button
          type="button"
          onClick={() => openForm("new")}
          className="rounded bg-gold px-4 py-2 font-medium text-on-gold transition hover:bg-gold-hover"
        >
          + Nueva película
        </button>
      </div>

      {/* Pestañas de baja lógica: cada una es un ?estado= distinto (una entrada propia en la caché). */}
      <div role="tablist" aria-label="Estado de las películas" className="flex gap-1 border-b border-border">
        <button
          type="button"
          role="tab"
          aria-selected={!showingInactive}
          onClick={() => changeTab(false)}
          className={tabClass(!showingInactive)}
        >
          Activas
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={showingInactive}
          onClick={() => changeTab(true)}
          className={tabClass(showingInactive)}
        >
          Inactivas
        </button>
      </div>

      {showingInactive && (
        <p className="text-sm text-muted">
          Películas dadas de baja: no se ven en el catálogo público. Podés restaurarlas o eliminarlas
          definitivamente.
        </p>
      )}

      {notice && (
        <p role="status" className="rounded border border-success/40 bg-success/10 p-3 text-sm text-green-300">
          {notice}
        </p>
      )}

      <MovieFilters
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onChange={setFilters}
        onClear={clearFilters}
      />

      {actionError && (
        <p role="alert" className="rounded border border-danger/40 bg-danger/10 p-3 text-sm text-red-300">
          {actionError}
        </p>
      )}

      {error && (
        <div role="alert" className="rounded border border-danger/40 bg-danger/10 p-3 text-sm text-red-300">
          No se pudieron cargar las películas: {getErrorMessage(error)}{" "}
          <button type="button" onClick={refetch} className="font-medium underline">
            Reintentar
          </button>
        </div>
      )}

      {isLoading && (
        <p role="status" className="text-muted">
          Cargando películas...
        </p>
      )}

      {data && movies.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-muted">{emptyMessage}</p>
          {isFiltered ? (
            <button type="button" onClick={clearFilters} className="mt-2 text-gold underline">
              Limpiar filtros
            </button>
          ) : (
            !showingInactive && (
              <button
                type="button"
                onClick={() => openForm("new")}
                className="mt-2 text-gold underline"
              >
                Crear la primera
              </button>
            )
          )}
        </div>
      )}

      {data && movies.length > 0 && (
        <>
          <p role="status" className="text-sm text-muted">
            {data.meta.total} {data.meta.total === 1 ? "película" : "películas"}{" "}
            {showingInactive
              ? data.meta.total === 1
                ? "inactiva"
                : "inactivas"
              : data.meta.total === 1
                ? "activa"
                : "activas"}
          </p>
          <div
            className={`overflow-x-auto rounded-xl border border-border bg-surface shadow-sm transition-opacity ${isFetching ? "opacity-50" : ""}`}
          >
            <table className="w-full min-w-xl text-left text-sm">
              <caption className="sr-only">
                {showingInactive ? "Películas dadas de baja" : "Películas activas"}
              </caption>
              <thead className="bg-surface-2 text-muted">
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
                  {/* Autor = quién la cargó (createdBy): dato histórico, no da permisos (DF26). */}
                  <th scope="col" className="px-3 py-2 font-medium">
                    Autor
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {movies.map((movie) => (
                  <tr key={movie._id} className={movie.active ? "" : "bg-amber-500/5"}>
                    <td className="px-3 py-2 font-medium">
                      <Link to={`/peliculas/${movie._id}`} className="hover:underline">
                        {movie.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{GENRE_LABELS[movie.genre]}</td>
                    <td className="px-3 py-2">{formatYear(movie.releaseDate)}</td>
                    <td className="px-3 py-2">{movie.rating.toFixed(1)}</td>
                    <td className="px-3 py-2">
                      {movie.active ? (
                        <span className={movie.available ? "text-success" : "text-muted"}>
                          {movie.available ? "Disponible" : "No disponible"}
                        </span>
                      ) : (
                        <span className="flex flex-col items-start gap-0.5">
                          <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-300">
                            Inactiva
                          </span>
                          {movie.deletedAt && (
                            <span className="text-xs text-muted">
                              desde {formatDateTime(movie.deletedAt)}
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">{formatAuthor(movie.author)}</td>
                    <td className="px-3 py-2">
                      {movie.active ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openForm(movie)}
                            aria-label={`Editar ${movie.title}`}
                            className="rounded border border-border px-2 py-1 hover:bg-surface-2"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              clearMessages();
                              setDeleting({ movie, mode: "soft" });
                            }}
                            aria-label={`Dar de baja ${movie.title}`}
                            className="rounded border border-amber-500/60 px-2 py-1 text-amber-300 hover:bg-amber-500/10"
                          >
                            Dar de baja
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleRestore(movie)}
                            disabled={restoringId === movie._id}
                            aria-label={`Restaurar ${movie.title}`}
                            className="rounded border border-success/60 px-2 py-1 text-green-300 hover:bg-success/10 disabled:opacity-50"
                          >
                            {restoringId === movie._id ? "Restaurando..." : "Restaurar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              clearMessages();
                              setDeleting({ movie, mode: "permanent" });
                            }}
                            aria-label={`Eliminar definitivamente ${movie.title}`}
                            className="rounded border border-danger/60 px-2 py-1 text-red-400 hover:bg-danger/10"
                          >
                            Eliminar definitivamente
                          </button>
                        </div>
                      )}
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

      {/* Baja lógica o física: cada una con su modal (Cancelar / Confirmar). */}
      {deleting && (
        <MovieDeleteDialog
          mode={deleting.mode}
          movie={deleting.movie}
          busy={deleting.mode === "soft" ? isSoftDeleting : isPermanentDeleting}
          onConfirm={() => handleDelete(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </section>
  );
};
