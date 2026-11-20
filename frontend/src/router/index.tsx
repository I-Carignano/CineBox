// Árbol de rutas centralizado (data router). Tres niveles de acceso: público, privado y privado por rol.
// Las rutas de admin se agregan en F8.
import { createBrowserRouter, redirect } from "react-router";
import { Layout } from "../layouts/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import { Login } from "../pages/Login";
import { MovieDetail } from "../pages/MovieDetail";
import { MoviesList } from "../pages/MoviesList";
import { NotFound } from "../pages/NotFound";
import { Profile } from "../pages/Profile";
import { Register } from "../pages/Register";

export const router = createBrowserRouter([
  // Fuera del Layout: pantalla completa, sin header
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    path: "/",
    element: <Layout />,
    children: [
      // Redirección fija: el loader corre antes de renderizar, así el Layout no llega a montarse con "/" vacío.
      { index: true, loader: () => redirect("/peliculas") },

      // Públicas
      { path: "peliculas", element: <MoviesList /> },
      { path: "peliculas/:id", element: <MovieDetail /> },

      // Privadas: cualquier usuario logueado
      {
        element: <ProtectedRoute />,
        children: [{ path: "perfil", element: <Profile /> }],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);
