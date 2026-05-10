import { NavLink, Outlet } from 'react-router-dom';
import './UsuariosLayout.css';

export default function UsuariosLayout() {
  return (
    <div className="shell">
      <nav className="barra-superior">
        <NavLink className="volver" to="/">← Menú</NavLink>
        <div className="separador"></div>
        <NavLink to="/usuarios/listar" className={({ isActive }) => isActive ? 'activo' : ''}>Listar</NavLink>
        <NavLink to="/usuarios/crear" className={({ isActive }) => isActive ? 'activo' : ''}>Crear</NavLink>
      </nav>
      <div className="contenido">
        <Outlet />
      </div>
    </div>
  );
}