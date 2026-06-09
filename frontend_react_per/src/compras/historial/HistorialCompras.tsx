import { useState, useEffect } from 'react';
import { historialCompras, type CompraPublica } from '../../services/compra.service';
import './HistorialCompras.css';

export default function HistorialCompras() {
    const [compras, setCompras] = useState<CompraPublica[]>([]);
    const [cargando, setCargando] = useState(true);
    const Limite = 20;
    const [pagina, setPagina] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => { cargarCompras(pagina); }, [pagina]);

    async function cargarCompras(paginaActual: number) {
        setCargando(true);
        const offset = paginaActual * Limite;
        try {
            setCompras(await historialCompras(offset, Limite));
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
                                {compras.map((c, i) => (
                                    <tr key={c.id_compra}>
                                        <td>{pagina * Limite + i + 1}</td>
                                        <td>{c.usuario.nombre}</td>
                                        <td>{c.total_productos}</td>
                                        <td>
                                            {c.productos.map(pro => (
                                                <span key={pro.producto_id} className="producto-tag">
                                                    {pro.nombre} x{pro.cantidad}
                                                    {pro.precio ? ` ($${Number(pro.precio).toFixed(2)} c/u)` : ''}
                                                </span>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="paginacion">
                            <button className="btn-paginacion" onClick={() => setPagina(p => p - 1)} disabled={pagina === 0}>
                                ← Anterior
                            </button>
                            <span className="pagina-actual">Página {pagina + 1}</span>
                            <button className="btn-paginacion" onClick={() => setPagina(p => p + 1)} disabled={compras.length < Limite}>
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
