import { NavLink, Outlet } from 'react-router-dom';
import './ProductosLayout.css';

export default function ProductosLayout() {
  return (
    <div className="shell">
      <nav className="barra-superior">
        <NavLink className="volver" to="/">← Menú</NavLink>
        <div className="separador"></div>
        <NavLink to="/productos/listar" className={({ isActive }) => isActive ? 'activo' : ''}>Listar</NavLink>
        <NavLink to="/productos/crear" className={({ isActive }) => isActive ? 'activo' : ''}>Crear</NavLink>
      </nav>
      <div className="contenido">
        <Outlet />
      </div>
    </div>
  );
}