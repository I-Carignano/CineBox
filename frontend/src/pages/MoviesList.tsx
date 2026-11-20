// Page: ruta pública "/peliculas". Los filtros salen de la URL y los datos de la caché de RTK Query.
import { useEffect } from "react";
import { useLocation } from "react-router";
import { MovieCard } from "../components/MovieCard";
import { MovieFilters } from "../components/MovieFilters";
import { Pagination } from "../components/Pagination";
import { useMovieFilters } from "../hooks/useMovieFilters";
import { getErrorMessage } from "../lib/api";
import { useGetMoviesQuery } from "../store/moviesApi";

export const MoviesList = () => {
  const { filters, setFilters, clearFilters, hasActiveFilters } = useMovieFilters();
  const location = useLocation();
  // `data` conserva el último resultado mientras se pide otro (isFetching): la lista no parpadea al paginar.
  const { data, isLoading, isFetching, error, refetch } = useGetMoviesQuery(filters);

  // Al cambiar de página, volver arriba del listado.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [filters.page]);

  const movies = data?.data ?? [];

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">Catálogo de películas</h2>

      <MovieFilters
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onChange={setFilters}
        onClear={clearFilters}
      />

      {error && (
        <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">
          No se pudieron cargar las películas: {getErrorMessage(error)}{" "}
          <button type="button" onClick={refetch} className="font-medium underline">
            Reintentar
          </button>
        </div>
      )}

      {isLoading && (
        <p role="status" className="text-slate-500">
          Cargando películas...
        </p>
      )}

      {data && movies.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-600">
            {hasActiveFilters || filters.page > 1
              ? "No hay películas que coincidan con tu búsqueda."
              : "Todavía no hay películas cargadas."}
          </p>
          {(hasActiveFilters || filters.page > 1) && (
            <button type="button" onClick={clearFilters} className="mt-2 text-brand-600 underline">
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {data && movies.length > 0 && (
        <>
          <p role="status" className="text-sm text-slate-600">
            {data.meta.total} {data.meta.total === 1 ? "película" : "películas"}
          </p>
          <ul
            className={`grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-3 lg:grid-cols-4 ${isFetching ? "opacity-50" : ""}`}
          >
            {movies.map((movie) => (
              <li key={movie._id} className="flex">
                <MovieCard movie={movie} listSearch={location.search} />
              </li>
            ))}
          </ul>
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onChange={(page) => setFilters({ page })}
          />
        </>
      )}
    </section>
  );
};
