import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  obtenerCompra,
  modificarCompra,
  type CompraPublica,
  type CompraItem,
  type ModificarCompra,
} from '../../services/compra.service';
import './EditarCompra.css';

export default function EditarCompra() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [compra, setCompra] = useState<CompraPublica | null>(null);
  const [nuevoUsuarioId, setNuevoUsuarioId] = useState('');
  const [cambiarProductos, setCambiarProductos] = useState(false);
  const [items, setItems] = useState<CompraItem[]>([]);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarCompra();
  }, [id]);

  async function cargarCompra() {
    if (!id) return;
    setError('');
    try {
      const data = await obtenerCompra(id);
      setCompra(data);
      setItems(data.productos.map(p => ({ producto_id: p.producto_id, cantidad: p.cantidad })));
    } catch {
      setError('Compra no encontrada');
    }
  }

  function agregarItem() {
    setItems([...items, { producto_id: '', cantidad: 1 }]);
  }

  function eliminarItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function actualizarItem(index: number, campo: keyof CompraItem, valor: string | number) {
    setItems(items.map((item, i) => i === index ? { ...item, [campo]: valor } : item));
  }

  async function guardarEdicion() {
    if (!compra) return;
    if (!nuevoUsuarioId.trim() && !cambiarProductos) {
      setError('Modifica al menos un campo');
      return;
    }
    if (cambiarProductos) {
      if (items.length === 0) { setError('Agrega al menos un producto'); return; }
      if (items.some(item => !item.producto_id.trim() || item.cantidad <= 0)) {
        setError('Todos los productos deben tener ID y cantidad válidos');
        return;
      }
    }

    const cambios: ModificarCompra = {};
    if (nuevoUsuarioId.trim()) cambios.usuario_id = nuevoUsuarioId.trim();
    if (cambiarProductos) cambios.productos = items;

    setError('');
    setExito('');
    setCargando(true);
    try {
      const actualizada = await modificarCompra(compra.id_compra, cambios);
      setExito('Compra modificada exitosamente');
      setCompra(actualizada);
      setNuevoUsuarioId('');
      setItems(actualizada.productos.map(p => ({ producto_id: p.producto_id, cantidad: p.cantidad })));
    } catch {
      setError('Error al modificar compra');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="pagina">
      {!compra && (
        <div className="form-container">
          <p className="cargando">Cargando compra...</p>
          {error && <p className="mensaje error">{error}</p>}
        </div>
      )}

      {compra && (
        <div className="form-container">
          <h2>Editar Compra</h2>
          <p className="subtitulo">
            Compra <strong>#{compra.id_compra}</strong> — Usuario: <strong>{compra.usuario.nombre}</strong>
          </p>

          <div className="campo">
            <label>Nuevo ID de Usuario</label>
            <input
              type="text"
              value={nuevoUsuarioId}
              onChange={e => setNuevoUsuarioId(e.target.value)}
              placeholder={`Actual: ${compra.usuario.id}`}
            />
          </div>

          <div className="toggle-section">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={cambiarProductos}
                onChange={e => setCambiarProductos(e.target.checked)}
              />
              Modificar lista de productos
            </label>
          </div>

          {cambiarProductos && (
            <div className="seccion-productos">
              <div className="seccion-header">
                <span className="seccion-label">Productos</span>
                <button className="btn-agregar" onClick={agregarItem} type="button">+ Agregar</button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="item-producto">
                  <div className="item-campos">
                    <div className="campo-item">
                      <label>ID Producto</label>
                      <input
                        type="text"
                        value={item.producto_id}
                        onChange={e => actualizarItem(index, 'producto_id', e.target.value)}
                        placeholder="UUID del producto"
                      />
                    </div>
                    <div className="campo-item">
                      <label>Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={e => actualizarItem(index, 'cantidad', Number(e.target.value))}
                        placeholder="1"
                      />
                    </div>
                  </div>
                  {items.length > 1 && (
                    <button className="btn-quitar" onClick={() => eliminarItem(index)} type="button">✕</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {error && <p className="mensaje error">{error}</p>}
          {exito && <p className="mensaje exito">{exito}</p>}

          <div className="form-acciones">
            <button className="btn-primary" onClick={guardarEdicion} disabled={cargando}>
              {cargando ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button className="btn-secondary" onClick={() => navigate('/compras/listar')}>Volver</button>
          </div>
        </div>
      )}
    </div>
  );
}
