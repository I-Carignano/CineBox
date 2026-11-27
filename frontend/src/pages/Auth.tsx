// Page de las rutas públicas "/login" y "/register": la misma tarjeta con pestañas (AuthCard), con la
// pestaña que corresponde a la URL. Las dos rutas usan este mismo componente, así al cambiar de pestaña
// la tarjeta no se vuelve a montar (el foco del teclado sigue en la pestaña) y solo cambia el formulario.
import { useLocation, type Location } from "react-router";
import { AuthCard, type AuthTab } from "../components/AuthCard";
import { LoginForm } from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";

export const Auth = () => {
  const location = useLocation();
  const active: AuthTab = location.pathname.startsWith("/register") ? "register" : "login";

  // Si venía de una ruta protegida (ProtectedRoute manda `from` en el state), el login vuelve ahí;
  // si no, al catálogo. El state se conserva al cambiar de pestaña.
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/peliculas";

  return (
    <AuthCard active={active} socialCallbackURL={active === "login" ? from : "/peliculas"}>
      {active === "login" ? <LoginForm from={from} /> : <RegisterForm />}
    </AuthCard>
  );
};
