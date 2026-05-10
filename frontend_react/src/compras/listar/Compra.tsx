import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  obtenerCompra,
  eliminarCompra,
  type CompraPublica,
} from '../../services/compra.service';
import './Compra.css';

export default function Compras() {
  const [buscarPorId, setBuscarPorId] = useState<number | ''>('');
  const [buscando, setBuscando] = useState(false);
  const [compraBuscada, setCompraBuscada] = useState<CompraPublica | null>(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function buscarPorIdCompra() {
    if (!buscarPorId) { setError('Por favor ingresa un ID de compra'); return; }
    const id = Number(buscarPorId);
    if (isNaN(id)) { setError('El ID debe ser un número válido'); return; }
    setBuscando(true);
    setError('');
    setCompraBuscada(null);
    try {
      const data = await obtenerCompra(id);
      setCompraBuscada(data);
    } catch {
      setError(`No se encontró compra con ID ${id}`);
    } finally {
      setBuscando(false);
    }
  }

  function limpiarBusqueda() {
    setBuscarPorId('');
    setCompraBuscada(null);
    setError('');
  }

  function eliminar(id: number) {
    setIdAEliminar(id);
    setMostrarConfirmacion(true);
  }

  async function confirmarEliminar() {
    if (!idAEliminar) return;
    setMostrarConfirmacion(false);
    setError('');
    try {
      await eliminarCompra(idAEliminar);
      setCompraBuscada(null);
    } catch {
      setError('Error al eliminar compra');
    } finally {
      setIdAEliminar(null);
    }
  }

  function cancelarEliminar() {
    setMostrarConfirmacion(false);
    setIdAEliminar(null);
  }

  return (
    <div className="pagina">
      <div className="contenedor">

        <div className="busqueda-container">
          <h2>Buscar Compra por ID</h2>
          <div className="busqueda-input">
            <input
              type="number"
              value={buscarPorId}
              onChange={e => setBuscarPorId(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ingresa el ID de la compra"
              onKeyDown={e => e.key === 'Enter' && buscarPorIdCompra()}
            />
            <button onClick={buscarPorIdCompra} disabled={buscando}>
              {buscando ? 'Buscando...' : 'Buscar'}
            </button>
            {compraBuscada && (
              <button className="btn-limpiar" onClick={limpiarBusqueda}>Limpiar</button>
            )}
          </div>
        </div>

        {compraBuscada && (
          <div className="tabla-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Total</th>
                  <th>Productos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{compraBuscada.id_compra}</td>
                  <td>
                    <div className="usuario-info">
                      <span className="usuario-nombre">{compraBuscada.usuario.nombre}</span>
                      <span className="usuario-id">#{compraBuscada.usuario.id}</span>
                    </div>
                  </td>
                  <td>{compraBuscada.total_productos}</td>
                  <td>
                    {compraBuscada.productos.map(p => (
                      <span key={p.producto_id} className="producto-tag">
                        #{p.producto_id} x{p.cantidad}
                      </span>
                    ))}
                  </td>
                  <td className="acciones">
                    <Link className="btn-editar" to={`/compras/editar/${compraBuscada.id_compra}`}>Editar</Link>
                    <button className="btn-eliminar" onClick={() => eliminar(compraBuscada.id_compra)}>Eliminar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {error && <p className="error">{error}</p>}

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