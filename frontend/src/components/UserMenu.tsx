// Avatar con menú desplegable del header: Perfil, Admin (solo admin y superadmin) y Cerrar sesión.
// Patrón "disclosure" (botón con aria-expanded + panel de links): se recorre con Tab y cierra con Escape
// (devuelve el foco al avatar), con clic afuera y al elegir una opción.
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import { isAdminRole } from "../lib/roles";
import { ChevronDownIcon } from "./ui/icons";

interface UserMenuProps {
  user: { name: string; image?: string | null; role?: string | null; username?: string | null };
  onLogout: () => void;
}

const itemClass =
  "block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-surface-2";

export const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Mientras está abierto: Escape y clic afuera lo cierran.
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  const close = () => setOpen(false);
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 rounded-full p-0.5 transition hover:bg-surface-2"
      >
        {user.image ? (
          <img src={user.image} alt="" className="size-9 rounded-full object-cover" />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-full bg-gold-soft font-display font-semibold text-gold"
          >
            {initial}
          </span>
        )}
        <span className="sr-only">Menú de {user.name}</span>
        <ChevronDownIcon className="hidden size-4 text-muted sm:block" />
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-border bg-surface p-1 shadow-lg"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium">{user.name}</p>
            {user.username && <p className="truncate text-xs text-muted">@{user.username}</p>}
          </div>
          <ul className="pt-1">
            <li>
              <Link to="/perfil" onClick={close} className={itemClass}>
                Perfil
              </Link>
            </li>
            {isAdminRole(user.role) && (
              <li>
                <Link to="/admin" onClick={close} className={itemClass}>
                  Admin
                </Link>
              </li>
            )}
            <li>
              <button
                type="button"
                onClick={() => {
                  close();
                  onLogout();
                }}
                className={`${itemClass} text-red-300`}
              >
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
