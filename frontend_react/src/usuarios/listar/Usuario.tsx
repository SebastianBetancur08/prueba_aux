import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  buscarUsuarios,
  obtenerComprasUsuario,
  eliminarUsuario,
  type UsuarioPublico,
  type CompraPublica,
} from '../../services/usuario.service';
import './Usuario.css';

export default function Usuarios() {

  const [compras, setCompras] = useState<CompraPublica[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioPublico | null>(null);
  const [cargandoCompras, setCargandoCompras] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [buscarPorId, setBuscarPorId] = useState<number | ''>('');
  const [buscandoUsuario, setBuscandoUsuario] = useState(false);
  const [usuarioBuscado, setUsuarioBuscado] = useState<UsuarioPublico | null>(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);

  async function buscarPorIdUsuario() {
    if (!buscarPorId) { setError('Por favor ingresa un ID de usuario'); return; }
    const id = Number(buscarPorId);
    if (isNaN(id)) { setError('El ID debe ser un número válido'); return; }
    setBuscandoUsuario(true);
    setError('');
    setUsuarioBuscado(null);
    setCompras([]);
    setUsuarioSeleccionado(null);
    try {
      const data = await buscarUsuarios([id]);
      if (data.length > 0) {
        setUsuarioBuscado(data[0]);
      } else {
        setError(`No se encontró usuario con ID ${id}`);
      }
    } catch {
      setError(`Error al buscar usuario con ID ${id}`);
    } finally {
      setBuscandoUsuario(false);
    }
  }

  function limpiarBusqueda() {
    setBuscarPorId('');
    setUsuarioBuscado(null);
    setCompras([]);
    setUsuarioSeleccionado(null);
    setError('');
    setExito('');
  }

  async function verCompras(usuario: UsuarioPublico) {
    if (usuarioSeleccionado?.id === usuario.id) {
      setUsuarioSeleccionado(null);
      setCompras([]);
      return;
    }
    setUsuarioSeleccionado(usuario);
    setCargandoCompras(true);
    setCompras([]);
    setError('');
    try {
      const data = await obtenerComprasUsuario(usuario.id);
      setCompras(data);
    } catch {
      setError('Error al cargar compras');
    } finally {
      setCargandoCompras(false);
    }
  }

  function eliminar(id: number) {
    setIdAEliminar(id);
    setMostrarConfirmacion(true);
  }

  async function confirmarEliminar() {
    if (!idAEliminar) return;
    const nombreEliminado = usuarioBuscado?.nombre;
    setMostrarConfirmacion(false);
    setError('');
    setExito('');
    try {
      await eliminarUsuario(idAEliminar);
      if (usuarioSeleccionado?.id === idAEliminar) {
        setUsuarioSeleccionado(null);
        setCompras([]);
      }
      setUsuarioBuscado(null);
      setBuscarPorId('');
      setExito(`Usuario "${nombreEliminado}" eliminado correctamente`);
    } catch {
      setError('Error al eliminar usuario');
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
          <h2>Buscar Usuario por ID</h2>
          <div className="busqueda-input">
            <input
              type="number"
              value={buscarPorId}
              onChange={e => setBuscarPorId(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ingresa el ID del usuario"
              onKeyDown={e => e.key === 'Enter' && buscarPorIdUsuario()}
            />
            <button onClick={buscarPorIdUsuario} disabled={buscandoUsuario}>
              {buscandoUsuario ? 'Buscando...' : 'Buscar'}
            </button>
            {(usuarioBuscado || error) && (
              <button className="btn-limpiar" onClick={limpiarBusqueda}>Limpiar</button>
            )}
          </div>
        </div>

        {usuarioBuscado && (
          <div className="tabla-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{usuarioBuscado.id}</td>
                  <td>{usuarioBuscado.nombre}</td>
                  <td>{usuarioBuscado.email ?? '—'}</td>
                  <td className="acciones">
                    <button className="btn-compras" onClick={() => verCompras(usuarioBuscado)}>
                      {usuarioSeleccionado?.id === usuarioBuscado.id ? 'Ocultar compras' : 'Ver compras'}
                    </button>
                    <Link className="btn-editar" to={`/usuarios/editar/${usuarioBuscado.id}`}>Editar</Link>
                    <button className="btn-eliminar" onClick={() => eliminar(usuarioBuscado.id)}>Eliminar</button>
                  </td>
                </tr>

                {usuarioSeleccionado?.id === usuarioBuscado.id && (
                  <tr className="fila-compras">
                    <td colSpan={4}>
                      {cargandoCompras && <p>Cargando compras...</p>}
                      {!cargandoCompras && compras.length === 0 && <p>Este usuario no tiene compras.</p>}
                      {!cargandoCompras && compras.length > 0 && (
                        <table className="tabla-compras">
                          <thead>
                            <tr>
                              <th>ID Compra</th>
                              <th>Total productos</th>
                              <th>Productos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {compras.map(compra => (
                              <tr key={compra.id_compra}>
                                <td>{compra.id_compra}</td>
                                <td>{compra.total_productos}</td>
                                <td>
                                  {compra.productos.map(p => (
                                    <span key={p.producto_id} className="producto-tag">
                                      #{p.producto_id} x{p.cantidad}
                                    </span>
                                  ))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {error && <p className="error">{error}</p>}
        {exito && <p className="exito">{exito}</p>}

      </div>

      {mostrarConfirmacion && (
        <div className="overlay">
          <div className="modal">
            <p>¿Eliminar a <strong>{usuarioBuscado?.nombre}</strong>? Esta acción no se puede deshacer.</p>
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