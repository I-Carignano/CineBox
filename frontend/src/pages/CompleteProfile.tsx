// Ruta "/completar-perfil": paso obligatorio para quien entró con GitHub/Google y todavía no tiene nombre de
// usuario (ver ProfileGate). Pide nombre de usuario, nombre y apellido (precargados desde la cuenta del
// proveedor, editables) y muestra el email solo lectura. Es la única pantalla que se puede ver sin username,
// y tiene "Cerrar sesión". Sin sesión va a /login; con username ya cargado, al catálogo.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate } from "react-router";
import { FormField } from "../components/FormField";
import { authClient, signOut, useSession } from "../lib/auth-client";
import { authErrorMessage, isUsernameError } from "../lib/auth-errors";
import { getFirstAndLastName } from "../lib/names";
import { profileSchema, type ProfileFormValues } from "../schemas/auth.schema";

export const CompleteProfile = () => {
  const { data: session, isPending } = useSession();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    // `values`: se rellena cuando llega la sesión. Nombre y apellido salen de la cuenta de GitHub/Google.
    values: session
      ? { username: session.user.username ?? "", ...getFirstAndLastName(session.user) }
      : { username: "", firstName: "", lastName: "" },
  });

  if (isPending) {
    return <p className="p-4 text-muted">Cargando...</p>;
  }
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  // isSubmitting: justo después de guardar la sesión ya trae el username, pero todavía hay que navegar.
  if (session.user.username && !isSubmitting) {
    return <Navigate to="/peliculas" replace />;
  }

  const onSubmit = async ({ username, firstName, lastName }: ProfileFormValues) => {
    const { error } = await authClient.updateUser({
      username,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
    });
    if (error) {
      // Usuario repetido o inválido: el error va en su campo.
      if (isUsernameError(error)) {
        setError("username", {
          message: authErrorMessage(error, "El nombre de usuario no es válido"),
        });
        return;
      }
      setError("root.server", {
        message: authErrorMessage(error, "No se pudo guardar. Probá de nuevo."),
      });
      return;
    }
    // Recarga completa (como el logout): así la sesión se vuelve a pedir ya con el username y el
    // ProfileGate no lo manda de vuelta acá con datos viejos.
    window.location.replace("/peliculas");
  };

  const handleLogout = async () => {
    await signOut();
    window.location.replace("/"); // al inicio, igual que el logout del header
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-4 font-sans">
      <section className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-text">Completá tu perfil</h1>
        <p className="mt-1 mb-4 text-sm text-muted">
          Para seguir, elegí tu nombre de usuario y revisá tu nombre. Es el que te identifica en
          CineBox.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-sm text-text">
            <span>Email</span>
            <span className="rounded border border-border bg-surface-2 px-3 py-2 text-muted">
              {session.user.email}
            </span>
          </div>
          <FormField
            label="Nombre de usuario"
            type="text"
            autoComplete="username"
            error={errors.username?.message}
            {...register("username")}
          />
          <FormField
            label="Nombre"
            type="text"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <FormField
            label="Apellido"
            type="text"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register("lastName")}
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
            {isSubmitting ? "Guardando..." : "Guardar y continuar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          <button type="button" onClick={handleLogout} className="text-muted underline">
            Cerrar sesión
          </button>
        </p>
      </section>
    </main>
  );
};
