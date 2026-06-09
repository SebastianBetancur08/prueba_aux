import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  buscarProductos,
  modificarProducto,
  type Producto,
  type ModificarProducto,
} from '../../services/producto.service';
import './EditarProducto.css';

export default function EditarProducto() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cambios, setCambios] = useState<ModificarProducto>({});
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarProducto();
  }, [id]);

  async function cargarProducto() {
    if (!id) return;
    setError('');
    try {
      const data = await buscarProductos([id]);
      if (data.length === 0) { setError('Producto no encontrado'); return; }
      setProducto(data[0]);
      setCambios({ nombre: data[0].nombre, precio: data[0].precio, url_de_imagen: data[0].url_de_imagen });
    } catch {
      setError('Error al cargar el producto');
    }
  }

  async function guardarEdicion() {
    if (!producto) return;
    const hayAlgo = Object.values(cambios).some(v => v !== null && v !== undefined && v !== '');
    if (!hayAlgo) { setError('Ingresa al menos un campo para modificar'); return; }
    setError('');
    setExito('');
    setCargando(true);
    try {
      const actualizado = await modificarProducto(producto.id, cambios);
      setExito('Producto modificado exitosamente');
      setProducto(actualizado);
    } catch {
      setError('Error al modificar producto');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="pagina">
      {!producto && (
        <div className="form-container">
          <p className="cargando">Cargando producto...</p>
          {error && <p className="mensaje error">{error}</p>}
        </div>
      )}

      {producto && (
        <div className="form-container">
          <h2>Editar Producto</h2>
          <p className="subtitulo">Editando: <strong>{producto.nombre}</strong> (ID: {producto.id})</p>

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
            <label>Precio</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cambios.precio ?? ''}
              onChange={e => setCambios({ ...cambios, precio: e.target.value ? Number(e.target.value) : null })}
              placeholder="Nuevo precio"
            />
          </div>

          <div className="campo">
            <label>URL de imagen</label>
            <input
              type="url"
              value={cambios.url_de_imagen ?? ''}
              onChange={e => setCambios({ ...cambios, url_de_imagen: e.target.value || null })}
              placeholder="Nueva URL de imagen (opcional)"
            />
          </div>

          {error && <p className="mensaje error">{error}</p>}
          {exito && <p className="mensaje exito">{exito}</p>}

          <div className="form-acciones">
            <button className="btn-primary" onClick={guardarEdicion} disabled={cargando}>
              {cargando ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button className="btn-secondary" onClick={() => navigate('/productos/listar')}>Volver</button>
          </div>
        </div>
      )}
    </div>
  );
}
