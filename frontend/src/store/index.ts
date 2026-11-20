// El store: un único objeto con todo el estado global. Cada reducer es una "rama" del árbol.
// La sesión no vive acá: la maneja useSession() de Better Auth (ver lib/auth-client.ts).
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { moviesApi } from "./moviesApi";

export const store = configureStore({
  reducer: {
    [moviesApi.reducerPath]: moviesApi.reducer, // state.moviesApi -> caché de RTK Query
  },
  // El middleware de RTK Query maneja la caché, el refetch y la invalidación por tags.
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(moviesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// useSelector / useDispatch ya tipados con nuestro store.
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
