// Ruta pública "/privacidad": qué datos guardamos, para qué, que no se comparten y cómo pedir la baja.
// Es una app de práctica de un trabajo universitario, así que el texto es corto y directo.
import { Link } from "react-router";

// Contacto para pedir la baja de la cuenta.
const CONTACT_EMAIL = "nachocarignano@gmail.com";

export const Privacy = () => {
  return (
    <article className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Política de privacidad</h1>
      <p className="mt-2 text-sm text-slate-600">
        Cinema 24 — trabajo práctico de Programación Web Full Stack (UAI).
      </p>

      <h2 className="mt-6 text-lg font-semibold">Qué datos guardamos</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
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
      <p className="mt-2 text-slate-700">
        Solo para que puedas iniciar sesión, identificarte en la app y mostrar tu @usuario como
        autor de las películas que cargás. No usamos tus datos para publicidad ni para nada más.
      </p>

      <h2 className="mt-6 text-lg font-semibold">Con quién los compartimos</h2>
      <p className="mt-2 text-slate-700">
        Con nadie. Tus datos no se venden ni se comparten con terceros. Lo único visible para otras
        personas es tu @usuario (o tu nombre) junto a las películas que creaste.
      </p>

      <h2 className="mt-6 text-lg font-semibold">Cómo pedir la baja</h2>
      <p className="mt-2 text-slate-700">
        Si querés que borremos tu cuenta y tus datos, escribí a{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-600 underline">
          {CONTACT_EMAIL}
        </a>{" "}
        y la eliminamos. Tus películas quedan en el catálogo, pero sin autor asociado.
      </p>

      <p className="mt-6 text-sm">
        <Link to="/peliculas" className="text-brand-600 underline">
          Volver al catálogo
        </Link>
      </p>
    </article>
  );
};
