import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerProductos, eliminarProducto, type Producto } from '../../services/producto.service';
import './Producto.css';

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true); setError('');
    try {
      setProductos(await obtenerProductos(0, 200));
    } catch {
      setError('Error al cargar productos');
    } finally {
      setCargando(false);
    }
  }

  const visibles = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.trim().toLowerCase())
  );

  function eliminar(id: string) { setIdAEliminar(id); setMostrarConfirmacion(true); }

  async function confirmarEliminar() {
    if (!idAEliminar) return;
    setMostrarConfirmacion(false);
    try {
      await eliminarProducto(idAEliminar);
      setProductos(prev => prev.filter(p => p.id !== idAEliminar));
    } catch {
      setError('Error al eliminar producto');
    } finally {
      setIdAEliminar(null);
    }
  }

  function cancelarEliminar() { setMostrarConfirmacion(false); setIdAEliminar(null); }

  return (
    <div className="pagina">
      <div className="contenedor">
        <div className="busqueda-container">
          <h2>Productos</h2>
          <div className="busqueda-input">
            <input
              type="text"
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              placeholder="Filtrar por nombre..."
            />
            <button onClick={cargar}>Refrescar</button>
          </div>
        </div>

        {cargando && <p className="cargando">Cargando...</p>}
        {error && <p className="error">{error}</p>}

        {!cargando && (
          <div className="tabla-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map(p => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>${Number(p.precio).toFixed(2)}</td>
                    <td>{p.stock ?? '—'}</td>
                    <td>{p.estado ?? '—'}</td>
                    <td className="acciones">
                      <Link className="btn-editar" to={`/productos/editar/${p.id}`}>Editar</Link>
                      <button className="btn-eliminar" onClick={() => eliminar(p.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {visibles.length === 0 && (
                  <tr><td colSpan={5} className="vacio">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarConfirmacion && (
        <div className="overlay">
          <div className="modal">
            <p>¿Estás seguro de que deseas eliminar este producto?</p>
            <div className="modal-acciones">
              <button className="btn-confirmar" onClick={confirmarEliminar}>Sí, eliminar</button>
              <button className="btn-cancelar" onClick={cancelarEliminar}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
