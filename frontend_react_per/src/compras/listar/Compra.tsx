import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { historialCompras, eliminarCompra, type CompraPublica } from '../../services/compra.service';
import './Compra.css';

export default function Compras() {
  const [compras, setCompras] = useState<CompraPublica[]>([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true); setError('');
    try {
      setCompras(await historialCompras(0, 200));
    } catch {
      setError('Error al cargar compras');
    } finally {
      setCargando(false);
    }
  }

  const visibles = compras.filter(c => {
    const q = filtro.trim().toLowerCase();
    return c.usuario.nombre.toLowerCase().includes(q) || c.id_compra.toLowerCase().includes(q);
  });

  function eliminar(id: string) { setIdAEliminar(id); setMostrarConfirmacion(true); }

  async function confirmarEliminar() {
    if (!idAEliminar) return;
    setMostrarConfirmacion(false);
    try {
      await eliminarCompra(idAEliminar);
      setCompras(prev => prev.filter(c => c.id_compra !== idAEliminar));
    } catch {
      setError('Error al eliminar compra');
    } finally {
      setIdAEliminar(null);
    }
  }

  function cancelarEliminar() { setMostrarConfirmacion(false); setIdAEliminar(null); }

  return (
    <div className="pagina">
      <div className="contenedor">
        <div className="busqueda-container">
          <h2>Compras</h2>
          <div className="busqueda-input">
            <input
              type="text"
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              placeholder="Filtrar por usuario o ID..."
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
                  <th>Usuario</th>
                  <th>Total</th>
                  <th>Productos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map(c => (
                  <tr key={c.id_compra}>
                    <td>{c.usuario.nombre}</td>
                    <td>{c.total_productos}</td>
                    <td>
                      {c.productos.map(p => (
                        <span key={p.producto_id} className="producto-tag">
                          {p.nombre} ×{p.cantidad}
                        </span>
                      ))}
                    </td>
                    <td className="acciones">
                      <Link className="btn-editar" to={`/compras/editar/${c.id_compra}`}>Editar</Link>
                      <button className="btn-eliminar" onClick={() => eliminar(c.id_compra)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {visibles.length === 0 && (
                  <tr><td colSpan={4} className="vacio">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarConfirmacion && (
        <div className="overlay">
          <div className="modal">
            <p>¿Estás seguro de que deseas eliminar esta compra?</p>
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
