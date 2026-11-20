// Agrupa los routers de cada recurso de la API. Las entidades nuevas se montan acá, no en server.ts.
import { Router } from "express";
import moviesRouter from "./movies.routes.js";
import { googleEnabled } from "../lib/auth.js";

const router = Router();

router.use("/peliculas", moviesRouter);

// El front no tiene .env: acá se entera de qué login social está habilitado (Google es opcional).
router.get("/config", (_req, res) => {
  res.json({ googleEnabled });
});

export default router;
