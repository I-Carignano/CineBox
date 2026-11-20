// Árbol de rutas centralizado (data router). Tres niveles de acceso: público, privado y privado por rol.
import { createBrowserRouter, redirect } from "react-router";
import { AdminLayout } from "../layouts/AdminLayout";
import { Layout } from "../layouts/Layout";
import { ADMIN_ROLES } from "../lib/roles";
import { ProfileGate } from "./ProfileGate";
import { ProtectedRoute } from "./ProtectedRoute";
import { CompleteProfile } from "../pages/CompleteProfile";
import { AdminMovies } from "../pages/AdminMovies";
import { AdminUsers } from "../pages/AdminUsers";
import { Login } from "../pages/Login";
import { MovieDetail } from "../pages/MovieDetail";
import { MoviesList } from "../pages/MoviesList";
import { MyMovies } from "../pages/MyMovies";
import { NotFound } from "../pages/NotFound";
import { Profile } from "../pages/Profile";
import { Register } from "../pages/Register";

export const router = createBrowserRouter([
  // Única ruta fuera del ProfileGate: ahí van los usuarios sociales sin username (si estuviera adentro,
  // el guard la redirigiría a sí misma sin parar). Pantalla completa, sin header.
  { path: "/completar-perfil", element: <CompleteProfile /> },

  {
    // ProfileGate: con sesión y sin username, TODAS las rutas de abajo redirigen a /completar-perfil.
    element: <ProfileGate />,
    children: [
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
            children: [
              { path: "perfil", element: <Profile /> },
              { path: "mis-peliculas", element: <MyMovies /> },
            ],
          },

          // Solo admin y superadmin: un user común vuelve a /perfil con el aviso "No tenés permisos".
          {
            element: <ProtectedRoute roles={ADMIN_ROLES} redirectTo="/perfil" />,
            children: [
              {
                path: "admin",
                element: <AdminLayout />,
                children: [
                  { index: true, element: <AdminMovies /> },
                  { path: "usuarios", element: <AdminUsers /> },
                ],
              },
            ],
          },

          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
