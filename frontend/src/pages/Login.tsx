// Ruta pública "/login": email + contraseña, GitHub y Google (si el backend lo habilitó).
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useLocation, useNavigate, type Location } from "react-router";
import { AuthCard } from "../components/AuthCard";
import { FormField } from "../components/FormField";
import { authErrorMessage } from "../lib/auth-errors";
import { signIn, useSession } from "../lib/auth-client";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";
import { useGetAuthProvidersQuery } from "../store/moviesApi";

// Códigos que Better Auth manda en /login?error=<código> cuando falla el login social.
const OAUTH_ERRORS: Record<string, string> = {
  account_not_linked:
    "Ya existe una cuenta con ese email. Ingresá con tu contraseña y conectá el proveedor desde tu perfil.",
  email_not_found:
    "Tu cuenta del proveedor no comparte un email. Hacelo público en tu cuenta o registrate con email.",
};

export const Login = () => {
  const { data: session } = useSession();
  const { data: providers } = useGetAuthProvidersQuery();
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

  // OAuth: redirige al proveedor; al volver, Better Auth crea la sesión y manda al callbackURL.
  // Si falla, vuelve a /login?error=<código> en vez de la página de error genérica de Better Auth.
  const handleSocial = (provider: "github" | "google") =>
    signIn.social({ provider, callbackURL: from, errorCallbackURL: "/login" });

  return (
    <AuthCard title="Iniciar sesión">
      {oauthError && (
        <p role="alert" className="mb-4 rounded bg-amber-50 p-3 text-sm text-amber-800">
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
          <p role="alert" className="text-sm text-red-600">
            {errors.root.server.message}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-brand-600 py-2 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />o<span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => handleSocial("github")}
          className="w-full rounded border border-slate-300 py-2 font-medium transition hover:bg-slate-100"
        >
          Entrar con GitHub
        </button>
        {providers?.googleEnabled && (
          <button
            type="button"
            onClick={() => handleSocial("google")}
            className="w-full rounded border border-slate-300 py-2 font-medium transition hover:bg-slate-100"
          >
            Entrar con Google
          </button>
        )}
      </div>
      <p className="mt-4 text-center text-sm text-slate-600">
        ¿No tenés cuenta?{" "}
        <Link to="/register" className="font-medium text-brand-600 underline">
          Crear cuenta
        </Link>
      </p>
    </AuthCard>
  );
};
