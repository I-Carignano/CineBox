// Punto de entrada del backend: arma la app de Express, expone /health y levanta el servidor tras conectar a Mongo.
// dotenv primero: los módulos que se importen después (ej. lib/auth.ts en F2) leen las variables apenas se cargan.
import "dotenv/config";
import express, { Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { connectMongoDB } from "./config/db.js";

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

// Sin cors ni cookie-parser: el front llama a /api desde su mismo origen (proxy de Vite en local,
// rewrite del Static Site en Render), así que no hay requests cross-origin.

// Better Auth ANTES de express.json(): el handler lee el body crudo del request.
// "*splat" es la sintaxis de comodín de Express 5 (en Express 4 era "*").
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

// F3: acá se monta el router de la API en /api/peliculas.

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

async function startServer(): Promise<void> {
  await connectMongoDB();

  app.listen(PORT, () => {
    console.log(`[server] escuchando en el puerto ${PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("[server] no se pudo iniciar:", error);
  process.exit(1);
});
