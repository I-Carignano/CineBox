// Page: ruta pública "/peliculas". Los filtros salen de la URL y los datos de la caché de RTK Query.
import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { MovieCard, MovieCardSkeleton } from "../components/MovieCard";
import { MovieFilters } from "../components/MovieFilters";
import { Pagination } from "../components/Pagination";
import { Button } from "../components/ui/Button";
import { buttonClasses } from "../components/ui/button-classes";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { useMovieFilters } from "../hooks/useMovieFilters";
import { getErrorMessage } from "../lib/api";
import { useSession } from "../lib/auth-client";
import { useGetMoviesQuery } from "../store/moviesApi";

// 12 por página: 2 filas de 6 en desktop, 3 de 4 en tablet y 6 de 2 en mobile.
const GRID_CLASS = "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";

export const MoviesList = () => {
  const { filters, setFilters, clearFilters, hasActiveFilters } = useMovieFilters();
  const location = useLocation();
  const { data: session, isPending } = useSession();
  // `data` conserva el último resultado mientras se pide otro (isFetching): la lista no parpadea al paginar.
  const { data, isLoading, isFetching, error, refetch } = useGetMoviesQuery(filters);

  // Al cambiar de página, volver arriba del listado.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [filters.page]);

  const movies = data?.data ?? [];

  return (
    <section className="flex flex-col gap-4">
      {/* Encabezado de la marca. "Crear cuenta" solo sin sesión (y no mientras se sabe si hay una: evita el parpadeo). */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-text">CineBox</h1>
          <p className="mt-1 text-text">
            El catálogo de películas de CineBox. Explorá sin cuenta, y registrate para tener tu
            perfil.
          </p>
        </div>
        {!isPending && !session && (
          <Link to="/register" className={buttonClasses("primary")}>
            Crear cuenta
          </Link>
        )}
      </header>

      <MovieFilters
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onChange={setFilters}
        onClear={clearFilters}
      />

      {error && (
        <ErrorState
          title="No se pudieron cargar las películas"
          message={getErrorMessage(error)}
          onRetry={refetch}
          retrying={isFetching}
        />
      )}

      {/* Mientras carga: la grilla con skeletons (el texto queda para lectores de pantalla). */}
      {isLoading && (
        <>
          <p role="status" className="sr-only">
            Cargando películas...
          </p>
          <ul className={GRID_CLASS}>
            {Array.from({ length: 12 }, (_, index) => (
              <li key={index} className="flex">
                <MovieCardSkeleton />
              </li>
            ))}
          </ul>
        </>
      )}

      {data &&
        movies.length === 0 &&
        (hasActiveFilters || filters.page > 1 ? (
          <EmptyState
            title="No hay películas que coincidan con tu búsqueda"
            description="Probá con otras palabras o sacá algún filtro."
            action={
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="Todavía no hay películas cargadas"
            description="Cuando un administrador cargue películas, van a aparecer acá."
          />
        ))}

      {data && movies.length > 0 && (
        <>
          <p role="status" className="text-sm text-muted">
            {data.meta.total} {data.meta.total === 1 ? "película" : "películas"}
          </p>
          <ul className={`${GRID_CLASS} transition-opacity ${isFetching ? "opacity-50" : ""}`}>
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
