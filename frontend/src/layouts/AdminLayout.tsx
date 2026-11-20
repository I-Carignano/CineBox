// Contenedor de las pantallas de administración: pestañas Películas / Usuarios y <Outlet /> para la que toque.
import { NavLink, Outlet } from "react-router";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-t px-4 py-2 text-sm font-medium ${
    isActive ? "border-b-2 border-brand-600 text-brand-700" : "text-slate-600 hover:text-slate-900"
  }`;

export const AdminLayout = () => {
  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Administración" className="flex gap-1 border-b border-slate-200">
        {/* end: "/admin" no debe quedar activa cuando se está en "/admin/usuarios" */}
        <NavLink to="/admin" end className={tabClass}>
          Películas
        </NavLink>
        <NavLink to="/admin/usuarios" className={tabClass}>
          Usuarios
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
};
