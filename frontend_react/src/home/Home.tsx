import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>Panel de Administración</h1>
        <p>Selecciona una sección para comenzar</p>
      </div>

      <div className="tarjetas">
        <Link to="/usuarios" className="tarjeta">
          <div className="tarjeta-icono">👤</div>
          <div className="tarjeta-info">
            <h2>Usuarios</h2>
            <p>Buscar, crear y editar usuarios</p>
          </div>
          <span className="tarjeta-flecha">→</span>
        </Link>

        <Link to="/productos" className="tarjeta">
          <div className="tarjeta-icono">📦</div>
          <div className="tarjeta-info">
            <h2>Productos</h2>
            <p>Gestionar el catálogo de productos</p>
          </div>
          <span className="tarjeta-flecha">→</span>
        </Link>

        <Link to="/compras" className="tarjeta">
          <div className="tarjeta-icono">🛒</div>
          <div className="tarjeta-info">
            <h2>Compras</h2>
            <p>Ver y administrar compras</p>
          </div>
          <span className="tarjeta-flecha">→</span>
        </Link>
      </div>
    </div>
  );
}