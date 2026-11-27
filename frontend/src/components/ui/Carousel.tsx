// Carrusel horizontal (DISENO §4): en mobile se desliza con el dedo y frena en cada ítem (scroll snap);
// en desktop suma flechas que corren casi un ancho de pantalla. Cada hijo es un ítem de la lista.
import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

interface CarouselProps {
  // Nombre accesible del carrusel (ej.: "Tendencias")
  label: string;
  children: ReactNode;
  // Ancho de cada ítem
  itemClassName?: string;
}

const arrowClass =
  "absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-surface/90 p-2 text-text shadow transition hover:text-gold disabled:pointer-events-none disabled:opacity-0 md:flex";

export const Carousel = ({ label, children, itemClassName = "w-36 sm:w-40" }: CarouselProps) => {
  const listRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Las flechas se apagan en los extremos.
  const updateArrows = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    setCanPrev(list.scrollLeft > 0);
    setCanNext(list.scrollLeft + list.clientWidth < list.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [updateArrows, children]);

  const scroll = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({
      left: direction * list.clientWidth * 0.8,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <section aria-label={label} aria-roledescription="carrusel" className="relative">
      <button
        type="button"
        aria-label="Anteriores"
        onClick={() => scroll(-1)}
        disabled={!canPrev}
        className={`${arrowClass} -left-3`}
      >
        <ChevronLeftIcon />
      </button>
      <ul
        ref={listRef}
        onScroll={updateArrows}
        className="flex snap-x snap-mandatory [scrollbar-width:thin] gap-3 overflow-x-auto pb-2"
      >
        {Children.toArray(children).map((child, index) => (
          <li key={index} className={`shrink-0 snap-start ${itemClassName}`}>
            {child}
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-label="Siguientes"
        onClick={() => scroll(1)}
        disabled={!canNext}
        className={`${arrowClass} -right-3`}
      >
        <ChevronRightIcon />
      </button>
    </section>
  );
};
