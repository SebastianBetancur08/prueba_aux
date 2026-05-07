import { useState } from 'react';
import { Link } from 'react-router-dom';
import {obtenerCompra,  eliminarCompra, type CompraPublica
} from '../../services/compra.service';
import './Compra.css';

export default function Compras() {

    const [buscarPorId, setBuscarPorId] = useState<number | ''>('');
    const [buscandocompra, setBuscandoCompra] = useState(false);
    const [compraSeleccionada, setCompraSeleccionada] = useState<CompraPublica | null>(null);
    const [compraBuscada, setCompraBUscada]  = useState<CompraPublica | null>(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] =  useState(false);
    const [idAEliminar, setIdAEliminar] = useState<number | null>(null);
    const [error, setError] = useState('');

    async function buscarPorIdCompra() {
        if (!buscarPorId) { setError('Por favor ingresa un ID de compra'); return; }
        const id =Number(buscarPorId);
        if (isNaN(id)) {setError('El ID debe ser un número válido'); return; }
        setBuscandoCompra(true);
        setError('');
        setCompraBUscada(null);
        setCompraSeleccionada(null);
        try {
            const data = await obtenerCompra(id);
            if (data.length > 0) {
                setCompraBUscada(data);
            } else {
                setError(`No se encontro compra con ID ${id}`);
            }
        } catch {
            setError(`Error al buscar compra con ID ${id}`);
        } finally {
            setBuscandoCompra(false);
        }
    }

    function limpiarBusqueda() {
        setBuscarPorId('');
        setCompraBUscada(null);
        setCompraSeleccionada(null);
        setError('');
    }

    async function eliminar(id: number) {
        setIdAEliminar(id);
        setMostrarConfirmacion(true);
    }

    async function confirmarEliminar() {
        if (!idAEliminar) return;
        setMostrarConfirmacion(false);
        setError('');
        try {
            await eliminarCompra(idAEliminar);
            setCompraBUscada(null);
            setIdAEliminar(null);
        } catch {
            setError('Error al eliminar compra');
            setIdAEliminar(null);
        }
    }

    function cancelarEliminar() {
        setMostrarConfirmacion(false);
        setIdAEliminar(null);
    }

    return (
        <div className="compra-container">
            <h2>Buscar Compra por ID</h2>
            <div className="compra-busqueda">
                <input
                    type="text"
                    placeholder="ID de compra"
                    value={buscarPorId}
                    onChange={(e) => setBuscarPorId(e.target.value)}
                />
                <button onClick={buscarPorIdCompra} disabled={buscandocompra}>
                    {buscandocompra ? 'Buscando...' : 'Buscar'}
                </button>
                <button onClick={limpiarBusqueda}>Limpiar</button>
            </div>
            {error && <p className="compra-error">{error}</p>}
            {compraBuscada && (
                <div className="compra-result">
                    <h3>Compra ID: {compraBuscada.id_compra}</h3>
                    <p>Usuario: {compraBuscada.usuario.nombre   } (ID: {compraBuscada.usuario.id_usuario})</p>
                    <p>Total Productos: {compraBuscada.total_productos}</p>
                    <h4>Productos:</h4>
                    <ul>
                        {compraBuscada.productos.map((prod) => (
                            <li key={prod.producto_id}>
                                Producto ID: {prod.producto_id}, Cantidad: {prod.cantidad}
                            </li>
                        ))}
                    </ul>
                    <div className="compra-actions">
                        <Link to={`/compras/modificar/${compraBuscada.id_compra}`} className="btn-modificar">Modificar</Link>
                        <button onClick={() => eliminar(compraBuscada.id_compra)} className="btn-eliminar">Eliminar</button>
                    </div>
                </div>
            )}
            {mostrarConfirmacion && (
                <div className="compra-confirmacion">
                    <p>¿Estás seguro que deseas eliminar esta compra?</p>
                    <button onClick={confirmarEliminar} className="btn-confirmar">Sí, eliminar</button>
                    <button onClick={cancelarEliminar} className="btn-cancelar">No, cancelar</button>
                </div>
            )}
        </div>
    );
}