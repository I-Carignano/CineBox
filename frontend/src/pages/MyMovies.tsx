// Page: ruta privada "/mis-peliculas" (cualquier usuario logueado). ABM de SUS películas.
import { MovieManager } from "../components/MovieManager";

export const MyMovies = () => <MovieManager scope="mine" />;
