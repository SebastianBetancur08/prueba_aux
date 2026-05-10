import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearCompra, type CompraItem } from '../../services/compra.service';
import './CrearCompra.css';

export default function CrearCompraPage() {
  const [usuarioId, setUsuarioId] = useState<number | ''>('');
  const [items, setItems] = useState<CompraItem[]>([{ producto_id: 0, cantidad: 1 }]);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  function agregarItem() {
    setItems([...items, { producto_id: 0, cantidad: 1 }]);
  }

  function eliminarItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function actualizarItem(index: number, campo: keyof CompraItem, valor: number) {
    setItems(items.map((item, i) => i === index ? { ...item, [campo]: valor } : item));
  }

  async function crear() {
    if (!usuarioId) { setError('El ID de usuario es obligatorio'); return; }
    if (items.length === 0) { setError('Agrega al menos un producto'); return; }
    if (items.some(item => item.producto_id <= 0 || item.cantidad <= 0)) {
      setError('Todos los productos deben tener ID y cantidad válidos');
      return;
    }
    setError('');
    setExito('');
    setCargando(true);
    try {
      await crearCompra({ usuario_id: Number(usuarioId), productos: items });
      setExito('Compra creada exitosamente');
      setUsuarioId('');
      setItems([{ producto_id: 0, cantidad: 1 }]);
    } catch {
      setError('Error al crear compra');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="pagina">
      <div className="form-container">
        <h2>Crear Compra</h2>

        <div className="campo">
          <label>ID de Usuario <span className="requerido">*</span></label>
          <input
            type="number"
            min="1"
            value={usuarioId}
            onChange={e => setUsuarioId(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Ingresa el ID del usuario"
          />
        </div>

        <div className="seccion-productos">
          <div className="seccion-header">
            <span className="seccion-label">Productos <span className="requerido">*</span></span>
            <button className="btn-agregar" onClick={agregarItem} type="button">+ Agregar</button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="item-producto">
              <div className="item-campos">
                <div className="campo-item">
                  <label>ID Producto</label>
                  <input
                    type="number"
                    min="1"
                    value={item.producto_id || ''}
                    onChange={e => actualizarItem(index, 'producto_id', Number(e.target.value))}
                    placeholder="ID"
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

        {error && <p className="mensaje error">{error}</p>}
        {exito && <p className="mensaje exito">{exito}</p>}

        <div className="form-acciones">
          <button className="btn-primary" onClick={crear} disabled={cargando}>
            {cargando ? 'Creando...' : 'Crear compra'}
          </button>
          <button className="btn-secondary" onClick={() => navigate('/compras/listar')}>Volver</button>
        </div>
      </div>
    </div>
  );
}