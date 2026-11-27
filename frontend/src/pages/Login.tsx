// Ruta pública "/login": email + contraseña, GitHub y Google (si el backend lo habilitó).
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useLocation, useNavigate, type Location } from "react-router";
import { AuthCard } from "../components/AuthCard";
import { FormField } from "../components/FormField";
import { authErrorMessage } from "../lib/auth-errors";
import { SocialLogin } from "../components/SocialLogin";
import { signIn, useSession } from "../lib/auth-client";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";

// Códigos que Better Auth manda en /login?error=<código> cuando falla el login social.
const OAUTH_ERRORS: Record<string, string> = {
  account_not_linked:
    "Ya existe una cuenta con ese email. Ingresá con tu contraseña y conectá el proveedor desde tu perfil.",
  // Cuenta dada de baja que intenta entrar con GitHub/Google (el código vuelve tal cual lo manda el backend).
  BANNED_USER: "Tu cuenta fue dada de baja. Contactá a un administrador.",
  banned: "Tu cuenta fue dada de baja. Contactá a un administrador.",
  email_not_found:
    "Tu cuenta del proveedor no comparte un email. Hacelo público en tu cuenta o registrate con email.",
};

export const Login = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Si venía de una ruta protegida vuelve ahí; si no, al catálogo.
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/peliculas";
  const oauthError = new URLSearchParams(location.search).get("error");

  // !isSubmitting: mientras onSubmit sigue corriendo no rebotar por la sesión recién creada.
  if (session && !isSubmitting) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (credentials: LoginFormValues) => {
    // Better Auth no tira excepción: devuelve { data, error }. Si sale bien setea la cookie y useSession se entera.
    const { error } = await signIn.email(credentials);
    if (error) {
      setError("root.server", {
        message: authErrorMessage(error, "No se pudo iniciar sesión. Probá de nuevo."),
      });
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <AuthCard title="Iniciar sesión">
      {oauthError && (
        <p role="alert" className="mb-4 rounded border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300">
          {OAUTH_ERRORS[oauthError] ??
            "No se pudo iniciar sesión con el proveedor. Probá de nuevo."}
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        {errors.root?.server && (
          <p role="alert" className="text-sm text-danger">
            {errors.root.server.message}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-gold py-2 font-medium text-on-gold transition hover:bg-gold-hover disabled:opacity-50"
        >
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      {/* Google / GitHub: si falla, vuelve a /login?error=<código> (se muestra arriba, OAUTH_ERRORS). */}
      <SocialLogin callbackURL={from} />
      <p className="mt-4 text-center text-sm text-muted">
        ¿No tenés cuenta?{" "}
        <Link to="/register" className="font-medium text-gold underline">
          Crear cuenta
        </Link>
      </p>
    </AuthCard>
  );
};
