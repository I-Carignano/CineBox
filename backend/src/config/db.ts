// Conexión a MongoDB con Mongoose: lee MONGODB_URI, registra logs de estado y expone connect/disconnect.
import mongoose from "mongoose";

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "Falta la variable de entorno MONGODB_URI. Revisá tu archivo .env (ver .env.example)."
    );
  }

  return uri;
}

export async function connectMongoDB(): Promise<void> {
  const uri = getMongoUri();

  mongoose.connection.on("connected", () => {
    console.log("[mongodb] conexión establecida");
  });

  mongoose.connection.on("error", (error: Error) => {
    console.error("[mongodb] error de conexión:", error.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[mongodb] conexión perdida");
  });

  await mongoose.connect(uri);
}

export async function disconnectMongoDB(): Promise<void> {
  await mongoose.connection.close();
  console.log("[mongodb] conexión cerrada");
}
