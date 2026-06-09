import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearProducto, type CrearProducto } from '../../services/producto.service';
import './CrearProducto.css';

export default function CrearProductoPage() {
  const [nuevoProducto, setNuevoProducto] = useState<CrearProducto>({
    nombre: '',
    precio: 0,
    url_de_imagen: null,
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  async function crear() {
    if (!nuevoProducto.nombre.trim()) { setError('El nombre es obligatorio'); return; }
    if (nuevoProducto.precio <= 0) { setError('El precio debe ser mayor a 0'); return; }
    setError('');
    setExito('');
    setCargando(true);
    try {
      await crearProducto(nuevoProducto);
      setExito('Producto creado exitosamente');
      setNuevoProducto({ nombre: '', precio: 0, url_de_imagen: null });
    } catch {
      setError('Error al crear producto');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="pagina">
      <div className="form-container">
        <h2>Crear Producto</h2>

        <div className="campo">
          <label>Nombre <span className="requerido">*</span></label>
          <input
            type="text"
            value={nuevoProducto.nombre}
            onChange={e => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
            placeholder="Ingresa el nombre del producto"
          />
        </div>

        <div className="campo">
          <label>Precio <span className="requerido">*</span></label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={nuevoProducto.precio || ''}
            onChange={e => setNuevoProducto({ ...nuevoProducto, precio: Number(e.target.value) })}
            placeholder="0.00"
          />
        </div>

        <div className="campo">
          <label>URL de imagen</label>
          <input
            type="url"
            value={nuevoProducto.url_de_imagen ?? ''}
            onChange={e => setNuevoProducto({ ...nuevoProducto, url_de_imagen: e.target.value || null })}
            placeholder="https://... (opcional)"
          />
        </div>

        {error && <p className="mensaje error">{error}</p>}
        {exito && <p className="mensaje exito">{exito}</p>}

        <div className="form-acciones">
          <button className="btn-primary" onClick={crear} disabled={cargando}>
            {cargando ? 'Creando...' : 'Crear producto'}
          </button>
          <button className="btn-secondary" onClick={() => navigate('/productos/listar')}>Volver</button>
        </div>
      </div>
    </div>
  );
}