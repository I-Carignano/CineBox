// Barra de filtros del listado. No guarda los filtros: los recibe por props y avisa los cambios con onChange.
// Solo la búsqueda tiene estado propio (el texto que se está tipeando), con debounce antes de avisar.
import { useEffect, useState } from "react";
import { GENRES, GENRE_LABELS, MIN_RATING_OPTIONS, SORT_OPTIONS } from "../lib/movies";
import type { MovieFilters as Filters } from "../types/movie";
import { SelectField } from "./SelectField";

interface MovieFiltersProps {
  filters: Filters;
  hasActiveFilters: boolean;
  onChange: (changes: Partial<Filters>) => void;
  onClear: () => void;
}

const DEBOUNCE_MS = 400;

export const MovieFilters = ({
  filters,
  hasActiveFilters,
  onChange,
  onClear,
}: MovieFiltersProps) => {
  const [text, setText] = useState(filters.search ?? "");

  // Debounce: espera a que se deje de tipear para no pedir al backend en cada tecla.
  useEffect(() => {
    const timer = setTimeout(() => {
      const search = text.trim() || undefined;
      if (search !== filters.search) onChange({ search });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // Solo depende del texto: si cambiara onChange en cada render, el timer se reiniciaría siempre.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Si la URL cambia desde afuera (botón "Atrás", "Limpiar filtros"), el input la sigue.
  useEffect(() => {
    setText(filters.search ?? "");
  }, [filters.search]);

  const availableValue = filters.available === undefined ? "" : String(filters.available);

  return (
    <form
      role="search"
      aria-label="Filtros del catálogo"
      onSubmit={(event) => event.preventDefault()}
      className="grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="flex flex-col gap-1 text-sm text-text sm:col-span-2 lg:col-span-4">
        <label htmlFor="movie-search">Buscar por título o director</label>
        <input
          id="movie-search"
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Ej: Matrix, Kubrick..."
          maxLength={100}
          className="rounded border border-border px-3 py-2"
        />
      </div>

      <SelectField
        label="Género"
        value={filters.genre ?? ""}
        onChange={(event) =>
          onChange({ genre: GENRES.find((genre) => genre === event.target.value) })
        }
      >
        <option value="">Todos</option>
        {GENRES.map((genre) => (
          <option key={genre} value={genre}>
            {GENRE_LABELS[genre]}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Disponibilidad"
        value={availableValue}
        onChange={(event) =>
          onChange({
            available: event.target.value === "" ? undefined : event.target.value === "true",
          })
        }
      >
        <option value="">Todas</option>
        <option value="true">Disponibles</option>
        <option value="false">No disponibles</option>
      </SelectField>

      <SelectField
        label="Rating mínimo"
        value={filters.minRating === undefined ? "" : String(filters.minRating)}
        onChange={(event) =>
          onChange({
            minRating: event.target.value === "" ? undefined : Number(event.target.value),
          })
        }
      >
        <option value="">Cualquiera</option>
        {MIN_RATING_OPTIONS.map((rating) => (
          <option key={rating} value={rating}>
            {rating} o más
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Ordenar por"
        value={`${filters.sortBy}:${filters.sortOrder}`}
        onChange={(event) => {
          // El value sale de SORT_OPTIONS ("campo:sentido"), así que el split es seguro.
          const [sortBy, sortOrder] = event.target.value.split(":") as [
            Filters["sortBy"],
            Filters["sortOrder"],
          ];
          onChange({ sortBy, sortOrder });
        }}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>

      {hasActiveFilters && (
        <div className="sm:col-span-2 lg:col-span-4">
          <button type="button" onClick={onClear} className="text-sm text-gold underline">
            Limpiar filtros
          </button>
        </div>
      )}
    </form>
  );
};
