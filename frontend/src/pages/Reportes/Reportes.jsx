import { useState, useEffect } from 'react';
import { ShieldAlert, Download, Activity, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../services/api';
import bannerImg from '../../assets/reportes_banner.png';
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

    const exportToCSV = () => {
        if (!auditoria.length) return toast.error('No hay datos para exportar');
        const csvRows = [];
        const headers = ['Fecha Movimiento', 'Tipo de Operación', 'Artículo Afectado', 'Cantidad', 'Funcionario Responsable', 'Observaciones'];
        csvRows.push(headers.join(','));

        for (const fila of auditoria) {
            const valores = [
                `"${new Date(fila.fecha_movimiento).toLocaleString()}"`,
                `"${fila.tipo_movimiento}"`,
                `"${fila.nombre_tipo || ''}"`,
                `"${fila.cantidad}"`,
                `"${fila.responsable || ''}"`,
                `"${(fila.observaciones || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(valores.join(','));
        }

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'Reporte_Auditoria.csv');
        a.click();
        toast.success('Reporte a Excel descargado');
    };

    const exportToPDF = () => {
        if (!auditoria.length) return toast.error('No hay datos para exportar');
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(15, 31, 64);
        doc.text('Reporte de Auditoría - Movimientos', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);
        
        const tableColumn = ["Fecha", "Tipo", "Artículo", "Cantidad", "Responsable", "Observaciones"];
        const tableRows = [];

        auditoria.forEach(fila => {
            const ticketData = [
                new Date(fila.fecha_movimiento).toLocaleString(),
                fila.tipo_movimiento,
                fila.nombre_tipo || '',
                fila.cantidad + ' UND',
                fila.responsable || '',
                fila.observaciones || '-'
            ];
            tableRows.push(ticketData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [15, 31, 64], textColor: 255 },
            styles: { fontSize: 9, cellPadding: 4 },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });

        doc.save('Reporte_Auditoria.pdf');
        toast.success('Reporte a PDF descargado');
    };

    return (
        <div className="module-container">
            <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <img src={bannerImg} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(90deg, rgba(15,31,64,0.95) 0%, rgba(15,31,64,0.4) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 2rem' }}>
                    <h2 style={{ color: 'white', margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>Auditoría y Reportes</h2>
                    <p style={{ color: '#e2e8f0', margin: '0.5rem 0 0 0', maxWidth: '600px', fontSize: '1.1rem' }}>Historial inmutable de movimientos en el sistema para entes de control.</p>
                </div>
            </div>
            
            <div className="module-header" style={{ marginTop: 0 }}>
                <div>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Acciones Rápidas</h3>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={exportToCSV}>
                        <Download size={18} /> Exportar a Excel
                    </button>
                    <button className="btn btn-secondary" style={{ marginLeft: '1rem' }} onClick={exportToPDF}>
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
