// Modal del lápiz de /perfil: edita el nombre de usuario o el nombre y apellido (React Hook Form + Zod).
// Guarda con authClient.updateUser (name = "Nombre Apellido"). Los errores de username salen en su campo.
// Al guardar bien se cierra solo: useSession se entera del cambio y el perfil se actualiza.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "../lib/auth-client";
import { authErrorMessage, isUsernameError } from "../lib/auth-errors";
import {
  nameFormSchema,
  usernameFormSchema,
  type NameFormValues,
  type UsernameFormValues,
} from "../schemas/auth.schema";
import { FormField } from "./FormField";
import { Modal } from "./Modal";
import { Button } from "./ui/Button";

interface ProfileEditModalProps {
  field: "username" | "name";
  initial: { username: string; firstName: string; lastName: string };
  onClose: () => void;
}

// Botones comunes de los dos formularios.
const FormButtons = ({
  isSubmitting,
  onCancel,
}: {
  isSubmitting: boolean;
  onCancel: () => void;
}) => (
  <div className="mt-2 flex justify-end gap-2">
    <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
      Cancelar
    </Button>
    <Button type="submit" loading={isSubmitting}>
      {isSubmitting ? "Guardando..." : "Guardar cambios"}
    </Button>
  </div>
);

const UsernameForm = ({ initial, onClose }: { initial: string; onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(usernameFormSchema),
    defaultValues: { username: initial },
  });

  const onSubmit = async ({ username }: UsernameFormValues) => {
    const { error } = await authClient.updateUser({ username });
    if (error) {
      if (isUsernameError(error)) {
        setError("username", {
          message: authErrorMessage(error, "El nombre de usuario no es válido"),
        });
      } else {
        setError("root.server", {
          message: authErrorMessage(error, "No se pudo guardar el cambio. Probá de nuevo."),
        });
      }
      return;
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
      <FormField
        label="Nombre de usuario"
        type="text"
        autoComplete="username"
        error={errors.username?.message}
        {...register("username")}
      />
      {errors.root?.server && (
        <p role="alert" className="text-sm text-danger">
          {errors.root.server.message}
        </p>
      )}
      <FormButtons isSubmitting={isSubmitting} onCancel={onClose} />
    </form>
  );
};

const NameForm = ({
  initial,
  onClose,
}: {
  initial: { firstName: string; lastName: string };
  onClose: () => void;
}) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(nameFormSchema),
    defaultValues: initial,
  });

  const onSubmit = async ({ firstName, lastName }: NameFormValues) => {
    const { error } = await authClient.updateUser({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
    });
    if (error) {
      setError("root.server", {
        message: authErrorMessage(error, "No se pudo guardar el cambio. Probá de nuevo."),
      });
      return;
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
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
      <FormButtons isSubmitting={isSubmitting} onCancel={onClose} />
    </form>
  );
};

export const ProfileEditModal = ({ field, initial, onClose }: ProfileEditModalProps) => (
  <Modal
    title={field === "username" ? "Editar nombre de usuario" : "Editar nombre"}
    onClose={onClose}
  >
    {field === "username" ? (
      <UsernameForm initial={initial.username} onClose={onClose} />
    ) : (
      <NameForm initial={initial} onClose={onClose} />
    )}
  </Modal>
);
