// Error general de un formulario (ej.: el que devuelve el backend), arriba del botón de enviar.
// Los errores de cada campo los muestra FormField debajo del input.
interface FormErrorProps {
  message?: string;
}

export const FormError = ({ message }: FormErrorProps) =>
  message ? (
    <p
      role="alert"
      className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-red-300"
    >
      {message}
    </p>
  ) : null;
