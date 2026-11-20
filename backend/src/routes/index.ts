// Agrupa los routers de cada recurso de la API. Las entidades nuevas se montan acá, no en server.ts.
import { Router } from "express";
import moviesRouter from "./movies.routes.js";

const router = Router();

router.use("/peliculas", moviesRouter);

export default router;
