// Ruta pública "/register": crea el usuario (siempre con rol "user") y Better Auth abre la sesión en el mismo paso.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate } from "react-router";
import { AuthCard } from "../components/AuthCard";
import { FormField } from "../components/FormField";
import { authErrorMessage } from "../lib/auth-errors";
import { signUp, useSession } from "../lib/auth-client";
import { registerSchema, type RegisterFormValues } from "../schemas/auth.schema";

export const Register = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  // !isSubmitting: signUp deja la sesión abierta y no hay que rebotar antes de que termine onSubmit.
  if (session && !isSubmitting) {
    return <Navigate to="/peliculas" replace />;
  }

  const onSubmit = async ({ name, email, password }: RegisterFormValues) => {
    // signUp ya deja la sesión abierta, no hace falta un login aparte.
    const { error } = await signUp.email({ name, email, password });
    if (error) {
      setError("root.server", {
        message: authErrorMessage(error, "No se pudo crear la cuenta. Probá de nuevo."),
      });
      return;
    }
    navigate("/peliculas", { replace: true });
  };

  return (
    <AuthCard title="Crear cuenta">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
        <FormField
          label="Nombre"
          type="text"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          label="Contraseña (mínimo 8 caracteres)"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <FormField
          label="Repetir contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
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
          {isSubmitting ? "Creando..." : "Crear cuenta"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        ¿Ya tenés cuenta?{" "}
        <Link to="/login" className="font-medium text-brand-600 underline">
          Ingresar
        </Link>
      </p>
    </AuthCard>
  );
};
