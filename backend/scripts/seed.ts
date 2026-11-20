// Seed (npm run seed): crea los usuarios de prueba (admin y user) y ~15 películas de ejemplo.
// Se puede correr varias veces: saltea los usuarios que ya existen y solo carga películas si la colección está vacía.
// Para sembrar la base de producción: MONGODB_URI="<uri de prod>" npm run seed (la URI solo en la terminal).
// dotenv no pisa variables que ya están en el entorno, así que esa URI gana sobre la del .env.
import "dotenv/config";
import mongoose from "mongoose";
import { auth } from "../src/lib/auth.js";
import { connectMongoDB } from "../src/config/db.js";
import Movie, { IMovie } from "../src/models/Movie.js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable ${name} en el .env (ver .env.example).`);
  return value;
}

// Better Auth guarda los usuarios en la colección "user".
const users = mongoose.connection.collection("user");

// Crea el usuario con signUpEmail (hashea la contraseña) si no existe. Devuelve su id.
async function ensureUser(name: string, email: string, password: string): Promise<string> {
  const existing = await users.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`[seed] ya existe: ${email}`);
    return String(existing._id);
  }

  const { user } = await auth.api.signUpEmail({ body: { name, email, password } });
  console.log(`[seed] usuario creado: ${email}`);
  return user.id;
}

type SeedMovie = Omit<IMovie, "createdBy">;

const MOVIES: SeedMovie[] = [
  { title: "El padrino", director: "Francis Ford Coppola", genre: "drama", durationMinutes: 175, releaseDate: new Date("1972-03-24"), rating: 9.2, available: true, synopsis: "La saga de la familia Corleone y el poder de la mafia en Nueva York." },
  { title: "Pulp Fiction", director: "Quentin Tarantino", genre: "suspenso", durationMinutes: 154, releaseDate: new Date("1994-10-14"), rating: 8.9, available: true, synopsis: "Historias cruzadas de criminales en Los Ángeles." },
  { title: "El señor de los anillos: La comunidad del anillo", director: "Peter Jackson", genre: "fantasia", durationMinutes: 178, releaseDate: new Date("2001-12-19"), rating: 8.8, available: true, synopsis: "Un hobbit emprende el viaje para destruir el Anillo Único." },
  { title: "Matrix", director: "Lana y Lilly Wachowski", genre: "ciencia_ficcion", durationMinutes: 136, releaseDate: new Date("1999-03-31"), rating: 8.7, available: true, synopsis: "Un hacker descubre que su realidad es una simulación." },
  { title: "Volver al futuro", director: "Robert Zemeckis", genre: "aventura", durationMinutes: 116, releaseDate: new Date("1985-07-03"), rating: 8.5, available: true, synopsis: "Un adolescente viaja al pasado en una máquina del tiempo." },
  { title: "Toy Story", director: "John Lasseter", genre: "animacion", durationMinutes: 81, releaseDate: new Date("1995-11-22"), rating: 8.3, available: true, synopsis: "Los juguetes de Andy cobran vida cuando nadie los mira." },
  { title: "El viaje de Chihiro", director: "Hayao Miyazaki", genre: "animacion", durationMinutes: 125, releaseDate: new Date("2001-07-20"), rating: 8.6, available: true, synopsis: "Una niña queda atrapada en un mundo de espíritus." },
  { title: "Alien, el octavo pasajero", director: "Ridley Scott", genre: "terror", durationMinutes: 117, releaseDate: new Date("1979-05-25"), rating: 8.5, available: true, synopsis: "La tripulación de una nave comercial enfrenta a una criatura mortal." },
  { title: "El resplandor", director: "Stanley Kubrick", genre: "terror", durationMinutes: 146, releaseDate: new Date("1980-05-23"), rating: 8.4, available: true, synopsis: "Un escritor enloquece mientras cuida un hotel aislado en invierno." },
  { title: "Mad Max: Furia en el camino", director: "George Miller", genre: "accion", durationMinutes: 120, releaseDate: new Date("2015-05-14"), rating: 8.1, available: true, synopsis: "Una persecución a toda velocidad por el desierto postapocalíptico." },
  { title: "Titanic", director: "James Cameron", genre: "romance", durationMinutes: 195, releaseDate: new Date("1997-12-19"), rating: 7.9, available: true, synopsis: "Un amor imposible a bordo del trasatlántico que se hundió en 1912." },
  { title: "Antes del amanecer", director: "Richard Linklater", genre: "romance", durationMinutes: 101, releaseDate: new Date("1995-01-27"), rating: 8.1, available: false, synopsis: "Dos desconocidos pasan una noche caminando por Viena." },
  { title: "Superbad", director: "Greg Mottola", genre: "comedia", durationMinutes: 113, releaseDate: new Date("2007-08-17"), rating: 7.6, available: true, synopsis: "Dos amigos intentan conseguir alcohol para una fiesta antes de graduarse." },
  { title: "Nueve reinas", director: "Fabián Bielinsky", genre: "suspenso", durationMinutes: 114, releaseDate: new Date("2000-08-31"), rating: 7.9, available: true, synopsis: "Dos estafadores se asocian para vender una falsificación en un solo día." },
  { title: "Bowling for Columbine", director: "Michael Moore", genre: "documental", durationMinutes: 120, releaseDate: new Date("2002-10-11"), rating: 7.6, available: false, synopsis: "Un documental sobre la violencia y las armas en Estados Unidos." },
];

async function seed(): Promise<void> {
  const adminEmail = requireEnv("SEED_ADMIN_EMAIL");
  const adminPassword = requireEnv("SEED_ADMIN_PASSWORD");
  const userEmail = requireEnv("SEED_USER_EMAIL");
  const userPassword = requireEnv("SEED_USER_PASSWORD");

  await connectMongoDB();
  // Solo el nombre de la base (nunca la URI): sirve para confirmar si se está sembrando dev o prod.
  console.log(`[seed] base de datos: ${mongoose.connection.name}`);

  const adminId = await ensureUser("Admin", adminEmail, adminPassword);
  await ensureUser("Usuario", userEmail, userPassword);

  // El plugin admin() crea a todos como "user": al admin se le pone el rol directo en la colección.
  await users.updateOne({ email: adminEmail.toLowerCase() }, { $set: { role: "admin" } });
  console.log(`[seed] rol admin asegurado para ${adminEmail}`);

  if ((await Movie.countDocuments()) > 0) {
    console.log("[seed] la colección de películas ya tiene datos: no se cargan las de ejemplo");
    return;
  }

  await Movie.insertMany(MOVIES.map((movie) => ({ ...movie, createdBy: adminId })));
  console.log(`[seed] ${MOVIES.length} películas cargadas`);
}

seed()
  .then(() => process.exit(0)) // process.exit porque el cliente de Better Auth deja conexiones abiertas
  .catch((error: unknown) => {
    console.error("[seed] falló:", error);
    process.exit(1);
  });
