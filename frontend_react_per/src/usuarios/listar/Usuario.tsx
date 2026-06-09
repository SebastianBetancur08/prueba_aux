import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import {
  obtenerUsuarios,
  obtenerComprasUsuario,
  eliminarUsuario,
  type UsuarioPublico,
  type CompraPublica,
} from '../../services/usuario.service';
import './Usuario.css';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioPublico[]>([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioPublico | null>(null);
  const [compras, setCompras] = useState<CompraPublica[]>([]);
  const [cargandoCompras, setCargandoCompras] = useState(false);

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [aEliminar, setAEliminar] = useState<UsuarioPublico | null>(null);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true); setError('');
    try {
      setUsuarios(await obtenerUsuarios(0, 200));
    } catch {
      setError('Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  }

  const visibles = usuarios.filter(u => {
    const q = filtro.trim().toLowerCase();
    return u.nombre.toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q);
  });

  async function verCompras(u: UsuarioPublico) {
    if (usuarioSeleccionado?.id === u.id) { setUsuarioSeleccionado(null); setCompras([]); return; }
    setUsuarioSeleccionado(u); setCargandoCompras(true); setCompras([]); setError('');
    try {
      setCompras(await obtenerComprasUsuario(u.id));
    } catch {
      setError('Error al cargar compras');
    } finally {
      setCargandoCompras(false);
    }
  }

  function eliminar(u: UsuarioPublico) { setAEliminar(u); setMostrarConfirmacion(true); }

  async function confirmarEliminar() {
    if (!aEliminar) return;
    setMostrarConfirmacion(false); setError(''); setExito('');
    try {
      await eliminarUsuario(aEliminar.id);
      setUsuarios(prev => prev.filter(x => x.id !== aEliminar.id));
      if (usuarioSeleccionado?.id === aEliminar.id) { setUsuarioSeleccionado(null); setCompras([]); }
      setExito(`Usuario "${aEliminar.nombre}" eliminado correctamente`);
    } catch {
      setError('Error al eliminar usuario');
    } finally {
      setAEliminar(null);
    }
  }

  function cancelarEliminar() { setMostrarConfirmacion(false); setAEliminar(null); }

  return (
    <div className="pagina">
      <div className="contenedor">
        <div className="busqueda-container">
          <h2>Usuarios</h2>
          <div className="busqueda-input">
            <input
              type="text"
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              placeholder="Filtrar por nombre o email..."
            />
            <button onClick={cargar}>Refrescar</button>
          </div>
        </div>

        {cargando && <p className="cargando">Cargando...</p>}
        {error && <p className="error">{error}</p>}
        {exito && <p className="exito">{exito}</p>}

        {!cargando && (
          <div className="tabla-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map(u => (
                  <Fragment key={u.id}>
                    <tr>
                      <td>{u.nombre}</td>
                      <td>{u.email ?? '—'}</td>
                      <td className="acciones">
                        <button className="btn-compras" onClick={() => verCompras(u)}>
                          {usuarioSeleccionado?.id === u.id ? 'Ocultar compras' : 'Ver compras'}
                        </button>
                        <Link className="btn-editar" to={`/usuarios/editar/${u.id}`}>Editar</Link>
                        <button className="btn-eliminar" onClick={() => eliminar(u)}>Eliminar</button>
                      </td>
                    </tr>

                    {usuarioSeleccionado?.id === u.id && (
                      <tr className="fila-compras">
                        <td colSpan={3}>
                          {cargandoCompras && <p>Cargando compras...</p>}
                          {!cargandoCompras && compras.length === 0 && <p>Este usuario no tiene compras.</p>}
                          {!cargandoCompras && compras.length > 0 && (
                            <table className="tabla-compras">
                              <thead>
                                <tr>
                                  <th>Total productos</th>
                                  <th>Productos</th>
                                </tr>
                              </thead>
                              <tbody>
                                {compras.map(compra => (
                                  <tr key={compra.id_compra}>
                                    <td>{compra.total_productos}</td>
                                    <td>
                                      {compra.productos.map(p => (
                                        <span key={p.producto_id} className="producto-tag">
                                          {p.nombre} ×{p.cantidad}
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
                  </Fragment>
                ))}
                {visibles.length === 0 && (
                  <tr><td colSpan={3} className="vacio">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarConfirmacion && (
        <div className="overlay">
          <div className="modal">
            <p>¿Eliminar a <strong>{aEliminar?.nombre}</strong>? Esta acción no se puede deshacer.</p>
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
