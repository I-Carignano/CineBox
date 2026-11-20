// Escapa metacaracteres de regex para que un texto de búsqueda no pueda inyectar su propia regex
// (ReDoS o coincidencias no deseadas) en un filtro $regex de Mongo.
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
