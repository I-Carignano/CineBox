// Formatos de visualización. La fecha viene en UTC (medianoche): se formatea en UTC para que no se corra un día.
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("es-AR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const formatYear = (iso: string): number => new Date(iso).getUTCFullYear();

// 136 -> "2 h 16 min", 120 -> "2 h", 45 -> "45 min"
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};
