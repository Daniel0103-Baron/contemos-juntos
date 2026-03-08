import { useState, useEffect } from 'react';
import { ShieldAlert, Download, Activity, FileText } from 'lucide-react';
import api from '../../services/api';
import '../Familias/Familias.css';

const Reportes = () => {
    const [auditoria, setAuditoria] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarReportes();
    }, []);

    const cargarReportes = async () => {
        try {
            const res = await api.get('/reportes/auditoria');
            setAuditoria(res.data);
        } catch (error) {
            console.error('Error cargando reportes:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="module-container">
            <div className="module-header">
                <div>
                    <h2>Auditoría y Reportes</h2>
                    <p>Historial inmutable de movimientos en el sistema para entes de control.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary">
                        <Download size={18} /> Exportar a Excel
                    </button>
                    <button className="btn btn-secondary" style={{ marginLeft: '1rem' }}>
                        <FileText size={18} /> Exportar a PDF
                    </button>
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: '1rem' }}>
                <div className="stat-card">
                    <div className="stat-icon bg-blue-light"><Activity /></div>
                    <div className="stat-details">
                        <h3>Movimientos Registrados</h3>
                        <p className="stat-number">{auditoria.length}</p>
                        <span className="stat-trend neutral">En los últimos 30 días</span>
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeftColor: 'var(--success)', borderLeftWidth: '4px' }}>
                    <div className="stat-icon bg-green-light"><ShieldAlert /></div>
                    <div className="stat-details">
                        <h3>Nivel de Transparencia</h3>
                        <p className="stat-number">100%</p>
                        <span className="stat-trend positive">Sin anomalías detectadas</span>
                    </div>
                </div>
            </div>

            <div className="card table-container">
                {loading ? (
                    <div className="loading-state">Cargando bitácora de auditoría...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Fecha Movimiento</th>
                                <th>Tipo de Operación</th>
                                <th>Artículo Afectado</th>
                                <th>Cantidad</th>
                                <th>Funcionario Responsable</th>
                                <th>Observaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditoria.length > 0 ? (
                                auditoria.map(a => (
                                    <tr key={a.id}>
                                        <td>{new Date(a.fecha_movimiento).toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${a.tipo_movimiento === 'INGRESO' ? 'badge-success' : 'badge-warning'}`}>
                                                {a.tipo_movimiento}
                                            </span>
                                        </td>
                                        <td className="fw-semibold">{a.nombre_tipo}</td>
                                        <td>{a.cantidad} UND</td>
                                        <td>{a.responsable}</td>
                                        <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {a.observaciones || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="empty-state">No existen registros de auditoría.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Reportes;
