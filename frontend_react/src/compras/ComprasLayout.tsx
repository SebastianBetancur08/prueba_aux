import { NavLink, Outlet } from 'react-router-dom';
import './ComprasLayout.css';

export default function ComprasLayout() {
    return (
     <div className="shell">
      <nav className="barra-superior">
        <NavLink className="volver" to="/">← Menú</NavLink>
        <div className="separador"></div>
        <NavLink to="/compras/listar" className={({ isActive }) => isActive ? 'activo' : ''}>Listar</NavLink>
        <NavLink to="/compras/crear" className={({ isActive }) => isActive ? 'activo' : ''}>Crear</NavLink>
      </nav>
      <div className="contenido">
        <Outlet />
      </div>
    </div>
  );
}