import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearUsuario, type CrearUsuario } from '../../services/usuario.service';
import './CrearUsuario.css';

export default function CrearUsuarioPage() {

  const [nuevoUsuario, setNuevoUsuario] = useState<CrearUsuario>({
    nombre: '',
    email: null,
    contrasena: '',
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  async function crear() {
    if (!nuevoUsuario.nombre.trim() || !nuevoUsuario.contrasena.trim()) {
      setError('Nombre y contraseña son obligatorios');
      return;
    }
    setError('');
    setExito('');
    setCargando(true);
    try {
      await crearUsuario(nuevoUsuario);
      setExito('Usuario creado exitosamente');
      setNuevoUsuario({ nombre: '', email: null, contrasena: '' });
    } catch {
      setError('Error al crear usuario');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="pagina">
      <div className="form-container">
        <h2>Crear Usuario</h2>

        <div className="campo">
          <label>Nombre <span className="requerido">*</span></label>
          <input
            type="text"
            value={nuevoUsuario.nombre}
            onChange={e => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
            placeholder="Ingresa el nombre"
          />
        </div>

        <div className="campo">
          <label>Email</label>
          <input
            type="email"
            value={nuevoUsuario.email ?? ''}
            onChange={e => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value || null })}
            placeholder="Ingresa el email (opcional)"
          />
        </div>

        <div className="campo">
          <label>Contraseña <span className="requerido">*</span></label>
          <input
            type="password"
            value={nuevoUsuario.contrasena}
            onChange={e => setNuevoUsuario({ ...nuevoUsuario, contrasena: e.target.value })}
            placeholder="Ingresa la contraseña"
          />
        </div>

        {error && <p className="mensaje error">{error}</p>}
        {exito && <p className="mensaje exito">{exito}</p>}

        <div className="form-acciones">
          <button className="btn-primary" onClick={crear} disabled={cargando}>
            {cargando ? 'Creando...' : 'Crear usuario'}
          </button>
          <button className="btn-secondary" onClick={() => navigate('/usuarios/listar')}>Volver</button>
        </div>
      </div>
    </div>
  );
}