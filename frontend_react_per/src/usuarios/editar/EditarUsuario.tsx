import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { buscarUsuarios, modificarUsuario, type UsuarioPublico, type ModificarUsuario } from '../../services/usuario.service';
import './EditarUsuario.css';

export default function EditarUsuario() {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<UsuarioPublico | null>(null);
  const [cambios, setCambios] = useState<ModificarUsuario>({});
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarUsuario();
  }, [id]);

  async function cargarUsuario() {
    if (!id) return;
    setError('');
    try {
      const data = await buscarUsuarios([id]);
      if (data.length === 0) { setError('Usuario no encontrado'); return; }
      setUsuario(data[0]);
      setCambios({ nombre: data[0].nombre, email: data[0].email, contrasena: '' });
    } catch {
      setError('Error al cargar el usuario');
    }
  }

  async function guardarEdicion() {
    if (!usuario) return;

    const payload: ModificarUsuario = {};
    const nombreTrim = cambios.nombre?.trim();
    if (nombreTrim && nombreTrim !== usuario.nombre) payload.nombre = nombreTrim;
    const emailNuevo = cambios.email?.trim() || null;
    if (emailNuevo !== usuario.email) payload.email = emailNuevo;
    if (cambios.contrasena?.trim()) payload.contrasena = cambios.contrasena;

    if (Object.keys(payload).length === 0) {
      setError('No realizaste ningún cambio');
      return;
    }

    setError('');
    setExito('');
    setCargando(true);
    try {
      const actualizado = await modificarUsuario(usuario.id, payload);
      setExito('Usuario modificado exitosamente');
      setUsuario(actualizado);
      setCambios({ nombre: actualizado.nombre, email: actualizado.email, contrasena: '' });
    } catch {
      setError('Error al modificar usuario');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="pagina">
      {!usuario && (
        <div className="form-container">
          <p className="cargando">Cargando usuario...</p>
          {error && <p className="mensaje error">{error}</p>}
        </div>
      )}

      {usuario && (
        <div className="form-container">
          <h2>Editar Usuario</h2>
          <p className="subtitulo">Editando: <strong>{usuario.nombre}</strong> (ID: {usuario.id})</p>

          <div className="campo">
            <label>Nombre</label>
            <input
              type="text"
              value={cambios.nombre ?? ''}
              onChange={e => setCambios({ ...cambios, nombre: e.target.value })}
              placeholder="Nuevo nombre"
            />
          </div>

          <div className="campo">
            <label>Email</label>
            <input
              type="email"
              value={cambios.email ?? ''}
              onChange={e => setCambios({ ...cambios, email: e.target.value || null })}
              placeholder="Nuevo email"
            />
          </div>

          <div className="campo">
            <label>Contraseña</label>
            <input
              type="password"
              value={cambios.contrasena ?? ''}
              onChange={e => setCambios({ ...cambios, contrasena: e.target.value })}
              placeholder="Nueva contraseña (opcional)"
            />
          </div>

          {error && <p className="mensaje error">{error}</p>}
          {exito && <p className="mensaje exito">{exito}</p>}

          <div className="form-acciones">
            <button className="btn-primary" onClick={guardarEdicion} disabled={cargando}>
              {cargando ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button className="btn-secondary" onClick={() => navigate('/usuarios/listar')}>Volver</button>
          </div>
        </div>
      )}
    </div>
  );
}
