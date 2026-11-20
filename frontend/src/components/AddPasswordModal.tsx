// Modal para agregar email y contraseña a una cuenta creada con GitHub o Google (POST /api/perfil/contrasena).
// El email es el de la cuenta (no se elige acá): "Vas a poder entrar con <email> y esta contraseña".
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "../lib/api";
import { addPasswordSchema, type AddPasswordFormValues } from "../schemas/auth.schema";
import { useSetPasswordMutation } from "../store/moviesApi";
import { FormField } from "./FormField";
import { Modal } from "./Modal";

interface AddPasswordModalProps {
  email: string;
  onClose: () => void;
  onDone: () => void;
}

export const AddPasswordModal = ({ email, onClose, onDone }: AddPasswordModalProps) => {
  const [setPassword] = useSetPasswordMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async ({ newPassword }: AddPasswordFormValues) => {
    try {
      // unwrap() lanza si el backend responde error (ya como string, ver axiosBaseQuery).
      await setPassword({ newPassword }).unwrap();
      onDone();
    } catch (err) {
      setError("root.server", { message: getErrorMessage(err) });
    }
  };

  return (
    <Modal title="Agregar email y contraseña" onClose={onClose}>
      <p className="mb-3 text-sm text-slate-600">
        Vas a poder entrar con <strong>{email}</strong> y esta contraseña.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
        <FormField
          label="Contraseña (mínimo 8 caracteres)"
          type="password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register("newPassword")}
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
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {isSubmitting ? "Guardando..." : "Guardar contraseña"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
