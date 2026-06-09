import { useState, useEffect } from 'react';
import { historialCompras, type CompraPublica } from '../../services/compra.service';
import './HistorialCompras.css';

export default function HistorialCompras() {

    const [compras, setCompras] = useState<CompraPublica[]>([]);
    const [cargando, setCargando] = useState(true);
    const Limite = 20;
    const [pagina, setPagina] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarCompras(pagina);
    }, [pagina]);

    async function cargarCompras(paginaActual: number) {
        setCargando(true);
        const skip = paginaActual * Limite;
        try {
            const data = await historialCompras(skip, Limite);
            setCompras(data);
        } catch {
            setError('Error al cargar compras');
        } finally {
            setCargando(false);
        }
    }

    if (cargando) return <div className="pagina"><p className="cargando">Cargando historial...</p></div>;
    if (error)    return <div className="pagina"><p className="error">{error}</p></div>;

    return (
        <div className="pagina">
            <div className="contenedor">
                <h2 className="titulo">Historial de compras</h2>

                {compras.length === 0 ? (
                    <p className="vacio">No hay compras registradas.</p>
                ) : (
                    <div className="tabla-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Usuario</th>
                                    <th>Total productos</th>
                                    <th>Productos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {compras.map((p, i) => (
                                    <tr key={p.id_compra}>
                                        <td>{pagina * Limite + i + 1}</td>
                                        <td>{p.usuario.nombre}</td>
                                        <td>{p.total_productos}</td>
                                        <td>
                                            {p.productos.map((pro, j) => (
                                                <span key={pro.producto_id} className="producto-tag">
                                                    Prod. {j + 1} x{pro.cantidad}
                                                </span>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="paginacion">
                            <button className="btn-paginacion" onClick={() => setPagina(p => p-1)} disabled={pagina === 0}>
                                ← Anterior
                            </button>
                            <span className="pagina-actual">Página {pagina + 1}</span>
                            <button className="btn-paginacion" onClick={() => setPagina(p => p+1)} disabled={compras.length < Limite}>
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}