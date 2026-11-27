// Pie de página chico y centrado: "© 2026 CineBox · Privacidad". Lo usan el Layout y las pantallas de
// login/registro. Va con mt-auto dentro de un contenedor flex en columna, así queda pegado al fondo de la
// ventana cuando el contenido es corto; el padding superior lo separa de las tarjetas cuando es largo.
import { Link } from "react-router";

export const Footer = () => {
  return (
    <footer className="mt-auto px-4 pt-8 pb-6 text-center text-xs text-muted">
      © 2026 CineBox ·{" "}
      <Link to="/privacidad" className="underline hover:text-text">
        Privacidad
      </Link>
    </footer>
  );
};
