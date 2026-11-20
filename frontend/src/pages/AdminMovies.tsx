// Page: ruta "/admin" (solo admin). ABM de TODAS las películas, con filtro "Solo mis películas".
import { MovieManager } from "../components/MovieManager";

export const AdminMovies = () => <MovieManager scope="all" />;
