// Ruta pública "/privacidad": qué datos guardamos, para qué, que no se comparten y cómo pedir la baja.
// Es una app de práctica de un trabajo universitario, así que el texto es corto y directo.
import { Link } from "react-router";

// Contacto para pedir la baja de la cuenta.
const CONTACT_EMAIL = "nachocarignano@gmail.com";

export const Privacy = () => {
  return (
    <article className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Política de privacidad</h1>
      <p className="mt-2 text-sm text-muted">
        CineBox — trabajo práctico de Programación Web Full Stack (UAI).
      </p>

      <h2 className="mt-6 text-lg font-semibold">Qué datos guardamos</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-text">
        <li>Tu email.</li>
        <li>Tu nombre y apellido.</li>
        <li>Tu nombre de usuario.</li>
        <li>
          Tu contraseña, solo si te registrás con email: se guarda cifrada, nunca en texto plano.
        </li>
        <li>
          Si entrás con GitHub o Google, recibimos de ese proveedor tu email y tu nombre. No
          accedemos a nada más de tu cuenta.
        </li>
      </ul>

      <h2 className="mt-6 text-lg font-semibold">Para qué los usamos</h2>
      <p className="mt-2 text-text">
        Solo para que puedas iniciar sesión e identificarte en la app con tu @usuario. No usamos tus
        datos para publicidad ni para nada más.
      </p>

      <h2 className="mt-6 text-lg font-semibold">Con quién los compartimos</h2>
      <p className="mt-2 text-text">
        Con nadie. Tus datos no se venden ni se comparten con terceros. Lo único visible para otras
        personas es tu @usuario (o tu nombre).
      </p>

      <h2 className="mt-6 text-lg font-semibold">Cómo pedir la baja</h2>
      <p className="mt-2 text-text">
        Si querés que borremos tu cuenta y tus datos, escribí a{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline">
          {CONTACT_EMAIL}
        </a>{" "}
        y la eliminamos.
      </p>

      <p className="mt-6 text-sm">
        <Link to="/peliculas" className="text-gold underline">
          Volver al catálogo
        </Link>
      </p>
    </article>
  );
};
