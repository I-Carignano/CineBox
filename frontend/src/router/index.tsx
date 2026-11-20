// Árbol de rutas centralizado (data router). Las rutas de login/registro, perfil y admin se agregan en F6 y F8.
import { createBrowserRouter, redirect } from "react-router";
import { Layout } from "../layouts/Layout";
import { MoviesList } from "../pages/MoviesList";
import { NotFound } from "../pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // Redirección fija: el loader corre antes de renderizar, así el Layout no llega a montarse con "/" vacío.
      { index: true, loader: () => redirect("/peliculas") },

      // Públicas
      { path: "peliculas", element: <MoviesList /> },

      { path: "*", element: <NotFound /> },
    ],
  },
]);
