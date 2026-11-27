// Pestaña "Ingresar" de la tarjeta de autenticación: email + contraseña con Better Auth.
// Si sale bien vuelve a `from` (la ruta protegida desde la que llegó) o al catálogo.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useLocation, useNavigate } from "react-router";
import { authErrorMessage } from "../lib/auth-errors";
import { signIn, useSession } from "../lib/auth-client";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";
import { FormField } from "./FormField";
import { Button } from "./ui/Button";
import { FormError } from "./ui/FormError";

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

export const LoginForm = ({ from }: { from: string }) => {
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
    <>
      {oauthError && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300"
        >
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
        <FormError message={errors.root?.server?.message} />
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
    </>
  );
};
