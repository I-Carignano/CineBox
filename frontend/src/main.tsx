import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import { store } from "./store";
import { router } from "./router";

// No hace falta pedir la sesión al cargar: useSession() la consulta sola y se actualiza después de signIn / signOut.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
