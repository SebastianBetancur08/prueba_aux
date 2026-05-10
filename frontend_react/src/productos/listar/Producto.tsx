import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  buscarProductos,
  eliminarProducto,
  type Producto,
} from '../../services/producto.service';
import './Producto.css';

export default function Productos() {
  const [buscarPorId, setBuscarPorId] = useState<number | ''>('');
  const [buscando, setBuscando] = useState(false);
  const [productoBuscado, setProductoBuscado] = useState<Producto | null>(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function buscarPorIdProducto() {
    if (!buscarPorId) { setError('Por favor ingresa un ID de producto'); return; }
    const id = Number(buscarPorId);
    if (isNaN(id)) { setError('El ID debe ser un número válido'); return; }
    setBuscando(true);
    setError('');
    setProductoBuscado(null);
    try {
      const data = await buscarProductos([id]);
      if (data.length > 0) {
        setProductoBuscado(data[0]);
      } else {
        setError(`No se encontró producto con ID ${id}`);
      }
    } catch {
      setError(`Error al buscar producto con ID ${id}`);
    } finally {
      setBuscando(false);
    }
  }

  function limpiarBusqueda() {
    setBuscarPorId('');
    setProductoBuscado(null);
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
      await eliminarProducto(idAEliminar);
      setProductoBuscado(null);
    } catch {
      setError('Error al eliminar producto');
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
          <h2>Buscar Producto por ID</h2>
          <div className="busqueda-input">
            <input
              type="number"
              value={buscarPorId}
              onChange={e => setBuscarPorId(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ingresa el ID del producto"
              onKeyDown={e => e.key === 'Enter' && buscarPorIdProducto()}
            />
            <button onClick={buscarPorIdProducto} disabled={buscando}>
              {buscando ? 'Buscando...' : 'Buscar'}
            </button>
            {productoBuscado && (
              <button className="btn-limpiar" onClick={limpiarBusqueda}>Limpiar</button>
            )}
          </div>
        </div>

        {productoBuscado && (
          <div className="tabla-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Imagen</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{productoBuscado.id}</td>
                  <td>{productoBuscado.nombre}</td>
                  <td>${Number(productoBuscado.precio).toFixed(2)}</td>
                  <td>
                    {productoBuscado.url_de_imagen
                      ? <a href={productoBuscado.url_de_imagen} target="_blank" rel="noreferrer" className="link-imagen">Ver imagen</a>
                      : '—'}
                  </td>
                  <td className="acciones">
                    <Link className="btn-editar" to={`/productos/editar/${productoBuscado.id}`}>Editar</Link>
                    <button className="btn-eliminar" onClick={() => eliminar(productoBuscado.id)}>Eliminar</button>
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