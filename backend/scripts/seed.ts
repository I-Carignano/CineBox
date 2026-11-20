// Seed (npm run seed): crea los usuarios de prueba (superadmin, admin y user) y las películas de ejemplo.
// Se puede correr varias veces sin duplicar: a los usuarios que ya existen les actualiza username/nombre/apellido,
// y por cada película del seed, si no hay una con ese título la inserta (createdBy = el admin del seed) y, si ya
// existe, solo le sincroniza el póster. Las películas que no son del seed no se tocan.
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

interface SeedUser {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Crea el usuario con signUpEmail (hashea la contraseña) si no existe. Si ya existe, le actualiza
// username/nombre/apellido (así el seed se puede volver a correr sobre usuarios creados antes de F8b).
// Devuelve su id.
async function ensureUser({ username, firstName, lastName, email, password }: SeedUser): Promise<string> {
  const name = `${firstName} ${lastName}`;
  const existing = await users.findOne({ email: email.toLowerCase() });
  if (existing) {
    await users.updateOne({ _id: existing._id }, { $set: { username, firstName, lastName, name } });
    console.log(`[seed] ya existe, datos actualizados: ${email}`);
    return String(existing._id);
  }

  const { user } = await auth.api.signUpEmail({ body: { name, email, password, username, firstName, lastName } });
  console.log(`[seed] usuario creado: ${email}`);
  return user.id;
}

type SeedMovie = Omit<IMovie, "createdBy">;

const MOVIES: SeedMovie[] = [
  { title: "El padrino", director: "Francis Ford Coppola", genre: "drama", durationMinutes: 175, releaseDate: new Date("1972-03-24"), rating: 9.2, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", synopsis: "La saga de la familia Corleone y el poder de la mafia en Nueva York." },
  { title: "Pulp Fiction", director: "Quentin Tarantino", genre: "suspenso", durationMinutes: 154, releaseDate: new Date("1994-10-14"), rating: 8.9, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", synopsis: "Historias cruzadas de criminales en Los Ángeles." },
  { title: "El señor de los anillos: La comunidad del anillo", director: "Peter Jackson", genre: "fantasia", durationMinutes: 178, releaseDate: new Date("2001-12-19"), rating: 8.8, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", synopsis: "Un hobbit emprende el viaje para destruir el Anillo Único." },
  { title: "Matrix", director: "Lana y Lilly Wachowski", genre: "ciencia_ficcion", durationMinutes: 136, releaseDate: new Date("1999-03-31"), rating: 8.7, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", synopsis: "Un hacker descubre que su realidad es una simulación." },
  { title: "Volver al futuro", director: "Robert Zemeckis", genre: "aventura", durationMinutes: 116, releaseDate: new Date("1985-07-03"), rating: 8.5, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg", synopsis: "Un adolescente viaja al pasado en una máquina del tiempo." },
  { title: "Toy Story", director: "John Lasseter", genre: "animacion", durationMinutes: 81, releaseDate: new Date("1995-11-22"), rating: 8.3, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg", synopsis: "Los juguetes de Andy cobran vida cuando nadie los mira." },
  { title: "El viaje de Chihiro", director: "Hayao Miyazaki", genre: "animacion", durationMinutes: 125, releaseDate: new Date("2001-07-20"), rating: 8.6, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", synopsis: "Una niña queda atrapada en un mundo de espíritus." },
  { title: "Alien, el octavo pasajero", director: "Ridley Scott", genre: "terror", durationMinutes: 117, releaseDate: new Date("1979-05-25"), rating: 8.5, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg", synopsis: "La tripulación de una nave comercial enfrenta a una criatura mortal." },
  { title: "El resplandor", director: "Stanley Kubrick", genre: "terror", durationMinutes: 146, releaseDate: new Date("1980-05-23"), rating: 8.4, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/nRj5511mZdTl4saWEPoj9QroTIu.jpg", synopsis: "Un escritor enloquece mientras cuida un hotel aislado en invierno." },
  { title: "Mad Max: Furia en el camino", director: "George Miller", genre: "accion", durationMinutes: 120, releaseDate: new Date("2015-05-14"), rating: 8.1, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg", synopsis: "Una persecución a toda velocidad por el desierto postapocalíptico." },
  { title: "Titanic", director: "James Cameron", genre: "romance", durationMinutes: 195, releaseDate: new Date("1997-12-19"), rating: 7.9, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg", synopsis: "Un amor imposible a bordo del trasatlántico que se hundió en 1912." },
  { title: "Antes del amanecer", director: "Richard Linklater", genre: "romance", durationMinutes: 101, releaseDate: new Date("1995-01-27"), rating: 8.1, available: false, posterUrl: "https://upload.wikimedia.org/wikipedia/en/d/da/Before_Sunrise_poster.jpg", synopsis: "Dos desconocidos pasan una noche caminando por Viena." },
  { title: "Superbad", director: "Greg Mottola", genre: "comedia", durationMinutes: 113, releaseDate: new Date("2007-08-17"), rating: 7.6, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg", synopsis: "Dos amigos intentan conseguir alcohol para una fiesta antes de graduarse." },
  { title: "Nueve reinas", director: "Fabián Bielinsky", genre: "suspenso", durationMinutes: 114, releaseDate: new Date("2000-08-31"), rating: 7.9, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/v8l85vxFe9J1uEvK9qyIMBlYJNv.jpg", synopsis: "Dos estafadores se asocian para vender una falsificación en un solo día." },
  { title: "Bowling for Columbine", director: "Michael Moore", genre: "documental", durationMinutes: 120, releaseDate: new Date("2002-10-11"), rating: 7.6, available: false, posterUrl: "https://upload.wikimedia.org/wikipedia/en/e/e7/Bowling_for_columbine.jpg", synopsis: "Un documental sobre la violencia y las armas en Estados Unidos." },
  { title: "La sospecha (Prisoners)", director: "Denis Villeneuve", genre: "suspenso", durationMinutes: 153, releaseDate: new Date("2013-09-20"), rating: 8.1, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/jsS3a3ep2KyBVmmiwaz3LvK49b1.jpg", synopsis: "Dos familias buscan a sus hijas desaparecidas y un padre decide hacer justicia por su cuenta." },
  { title: "Interestelar", director: "Christopher Nolan", genre: "ciencia_ficcion", durationMinutes: 169, releaseDate: new Date("2014-11-07"), rating: 8.7, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg", synopsis: "Un grupo de astronautas viaja por un agujero de gusano para buscar un nuevo hogar para la humanidad." },
  { title: "Pecados capitales (Se7en)", director: "David Fincher", genre: "suspenso", durationMinutes: 127, releaseDate: new Date("1995-09-22"), rating: 8.6, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/191nKfP0ehp3uIvWqgPbFmI4lv9.jpg", synopsis: "Dos detectives persiguen a un asesino que elige a sus víctimas según los siete pecados capitales." },
  { title: "El club de la pelea", director: "David Fincher", genre: "drama", durationMinutes: 139, releaseDate: new Date("1999-10-15"), rating: 8.8, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg", synopsis: "Un empleado insomne y un vendedor de jabones fundan un club clandestino de peleas que se les va de las manos." },
  { title: "Los Vengadores", director: "Joss Whedon", genre: "accion", durationMinutes: 143, releaseDate: new Date("2012-05-04"), rating: 8, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg", synopsis: "Un grupo de superhéroes se une para frenar la invasión alienígena de Loki a la Tierra." },
  { title: "Capitán América: El primer vengador", director: "Joe Johnston", genre: "accion", durationMinutes: 124, releaseDate: new Date("2011-07-22"), rating: 6.9, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/vSNxAJTlD0r02V9sPYpOjqDZXUK.jpg", synopsis: "Un joven frágil se convierte en supersoldado y enfrenta a Cráneo Rojo durante la Segunda Guerra Mundial." },
  { title: "Capitán América: El soldado del invierno", director: "Anthony y Joe Russo", genre: "accion", durationMinutes: 136, releaseDate: new Date("2014-04-04"), rating: 7.7, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/tVFRpFw3xTedgPGqxW0AOI8Qhh0.jpg", synopsis: "Steve Rogers descubre una conspiración dentro de S.H.I.E.L.D. y se enfrenta a un letal enemigo del pasado." },
  { title: "Iron Man: El hombre de hierro", director: "Jon Favreau", genre: "accion", durationMinutes: 126, releaseDate: new Date("2008-05-02"), rating: 7.9, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9COBYI0dWDJa.jpg", synopsis: "Un millonario fabricante de armas construye una armadura para escapar de su cautiverio y se vuelve superhéroe." },
  { title: "Sherlock Holmes", director: "Guy Ritchie", genre: "aventura", durationMinutes: 128, releaseDate: new Date("2009-12-25"), rating: 7.6, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/momkKuWburNTqKBF6ez7rvhYVhE.jpg", synopsis: "Holmes y Watson investigan una serie de crímenes ocultistas en el Londres victoriano." },
  { title: "Ex Machina", director: "Alex Garland", genre: "ciencia_ficcion", durationMinutes: 108, releaseDate: new Date("2015-04-10"), rating: 7.7, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/dmJW8IAKHKxFNiUnoDR7JfsK7Rp.jpg", synopsis: "Un programador es elegido para evaluar si la androide creada por su jefe tiene conciencia propia." },
  { title: "Cómo entrenar a tu dragón", director: "Dean DeBlois y Chris Sanders", genre: "animacion", durationMinutes: 98, releaseDate: new Date("2010-03-26"), rating: 8.1, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/ygGmAO60t8GyqUo9xYeYxSZAR3b.jpg", synopsis: "Un joven vikingo se hace amigo de un dragón herido y cambia la relación entre su pueblo y las criaturas." },
  { title: "Maze Runner: Correr o morir", director: "Wes Ball", genre: "ciencia_ficcion", durationMinutes: 113, releaseDate: new Date("2014-09-19"), rating: 6.8, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/ode14q7WtDugFDp78fo9lCsmay9.jpg", synopsis: "Un chico sin memoria despierta en un claro rodeado por un laberinto cambiante y busca la salida." },
  { title: "Maze Runner: Prueba de fuego", director: "Wes Ball", genre: "ciencia_ficcion", durationMinutes: 131, releaseDate: new Date("2015-09-18"), rating: 6.3, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/mYw7ZyejqSCPFlrT2jHZOESZDU3.jpg", synopsis: "Los sobrevivientes del laberinto cruzan un desierto devastado en busca de respuestas." },
  { title: "Maze Runner: La cura mortal", director: "Wes Ball", genre: "ciencia_ficcion", durationMinutes: 142, releaseDate: new Date("2018-01-26"), rating: 6.2, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/s8K0US4tUEoOrQ1LDh0eppuwGDx.jpg", synopsis: "Thomas y sus amigos arriesgan todo para rescatar a un compañero de la organización que los encerró." },
  { title: "Soy leyenda", director: "Francis Lawrence", genre: "ciencia_ficcion", durationMinutes: 101, releaseDate: new Date("2007-12-14"), rating: 7.2, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/iPDkaSdKk2jRLTM65UOEoKtsIZ8.jpg", synopsis: "Un científico, aparentemente el último hombre en Nueva York, lucha contra criaturas infectadas mientras busca una cura." },
  { title: "¿Qué pasó ayer?", director: "Todd Phillips", genre: "comedia", durationMinutes: 100, releaseDate: new Date("2009-06-05"), rating: 7.7, available: true, posterUrl: "https://image.tmdb.org/t/p/w500/A0uS9rHR56FeBtpjVki16M5xxSW.jpg", synopsis: "Tres amigos despiertan tras una despedida de soltero en Las Vegas sin recordar nada y sin el novio." },
];

async function seed(): Promise<void> {
  const adminEmail = requireEnv("SEED_ADMIN_EMAIL");
  const adminPassword = requireEnv("SEED_ADMIN_PASSWORD");
  const userEmail = requireEnv("SEED_USER_EMAIL");
  const userPassword = requireEnv("SEED_USER_PASSWORD");
  const superadminEmail = requireEnv("SEED_SUPERADMIN_EMAIL");
  const superadminPassword = requireEnv("SEED_SUPERADMIN_PASSWORD");

  await connectMongoDB();
  // Solo el nombre de la base (nunca la URI): sirve para confirmar si se está sembrando dev o prod.
  console.log(`[seed] base de datos: ${mongoose.connection.name}`);

  const adminId = await ensureUser({
    username: "admin",
    firstName: "Admin",
    lastName: "Peliculas",
    email: adminEmail,
    password: adminPassword,
  });
  await ensureUser({
    username: "usuario",
    firstName: "Usuario",
    lastName: "Prueba",
    email: userEmail,
    password: userPassword,
  });

  await ensureUser({
    username: "superadmin",
    firstName: "Super",
    lastName: "Admin",
    email: superadminEmail,
    password: superadminPassword,
  });

  // El plugin admin() crea a todos como "user": a admin y superadmin se les pone el rol directo en la colección.
  // El seed también los reactiva si alguien los dio de baja (así no se pierde el acceso en dev).
  await users.updateOne(
    { email: adminEmail.toLowerCase() },
    { $set: { role: "admin", banned: false, banReason: null, banExpires: null } }
  );
  await users.updateOne(
    { email: superadminEmail.toLowerCase() },
    { $set: { role: "superadmin", banned: false, banReason: null, banExpires: null } }
  );
  console.log(`[seed] roles asegurados: admin (${adminEmail}) y superadmin (${superadminEmail})`);

  // Películas: se busca por título cuáles del seed ya existen. Las que faltan se insertan (con su póster); a las
  // que ya existen solo se les pone el posterUrl (no se crean duplicados ni se tocan otros campos).
  const titles = MOVIES.map((movie) => movie.title);
  const existing = new Set<string>(await Movie.distinct("title", { title: { $in: titles } }));

  const missing = MOVIES.filter((movie) => !existing.has(movie.title));
  if (missing.length > 0) {
    await Movie.insertMany(missing.map((movie) => ({ ...movie, createdBy: adminId })));
  }

  let postersSet = 0;
  for (const { title, posterUrl } of MOVIES) {
    if (!posterUrl || !existing.has(title)) continue;
    // Solo si el póster es distinto: así una segunda corrida no modifica nada (ni siquiera updatedAt).
    const result = await Movie.updateOne({ title, posterUrl: { $ne: posterUrl } }, { $set: { posterUrl } });
    postersSet += result.modifiedCount;
  }
  console.log(`[seed] películas nuevas: ${missing.length}, pósters actualizados: ${postersSet}`);
}

seed()
  .then(() => process.exit(0)) // process.exit porque el cliente de Better Auth deja conexiones abiertas
  .catch((error: unknown) => {
    console.error("[seed] falló:", error);
    process.exit(1);
  });
