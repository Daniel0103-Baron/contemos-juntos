import { useState, useEffect } from 'react';
import { PackageSearch, Plus, AlertTriangle, TrendingUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../Familias/Familias.css'; // Usando estilos compartidos de tablas

const Inventario = () => {
    const navigate = useNavigate();
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id_tipo_ayuda: '',
        numero_lote: '',
        fecha_vencimiento: '',
        observaciones: ''
    });

    const normalizarCantidad = (item) => Number(item.cantidad_disponible ?? item.stock_disponible ?? item.lotes_disponibles ?? 0);

    useEffect(() => {
        cargarStock();
    }, []);

    const cargarStock = async () => {
        try {
            const res = await api.get('/inventario');
            setStock(res.data);
        } catch (error) {
            console.error('Error cargando inventario:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.id_tipo_ayuda || !formData.numero_lote) {
            alert('Seleccione tipo de ayuda y número de lote');
            return;
        }

        try {
            await api.post('/inventario/ingresos', {
                id_tipo_ayuda: Number(formData.id_tipo_ayuda),
                numero_lote: formData.numero_lote,
                fecha_vencimiento: formData.fecha_vencimiento || null,
                observaciones: formData.observaciones || null
            });

            alert('Ingreso registrado exitosamente');
            setShowModal(false);
            setFormData({
                id_tipo_ayuda: '',
                numero_lote: '',
                fecha_vencimiento: '',
                observaciones: ''
            });
            cargarStock();
        } catch (error) {
            console.error('Error registrando ingreso:', error);
            alert(error.response?.data?.mensaje || 'Error al registrar ingreso');
        }
    };

    return (
        <div className="module-container">
            <div className="module-header">
                <div>
                    <h2>Control de Inventario</h2>
                    <p>Monitoreo en tiempo real del stock de ayudas humanitarias.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" style={{ marginRight: '1rem' }} onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Registrar Ingreso (+Lote)
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/dashboard/reportes')}>
                        <TrendingUp size={18} /> Historial Movimientos
                    </button>
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: '1rem' }}>
                <div className="stat-card">
                    <div className="stat-icon bg-blue-light"><PackageSearch /></div>
                    <div className="stat-details">
                        <h3>Stock Total</h3>
                        <p className="stat-number">
                            {stock.reduce((acc, curr) => acc + normalizarCantidad(curr), 0)} UND
                        </p>
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeftColor: 'var(--warning)', borderLeftWidth: '4px' }}>
                    <div className="stat-icon bg-warning" style={{ background: '#fffbeb', color: '#b45309' }}>
                        <AlertTriangle />
                    </div>
                    <div className="stat-details">
                        <h3>Alertas de Stock</h3>
                        <p className="stat-number">
                            {stock.filter(s => normalizarCantidad(s) < 50).length}
                        </p>
                        <span className="stat-trend negative">Kits por debajo del mínimo</span>
                    </div>
                </div>
            </div>

            <div className="card table-container">
                {loading ? (
                    <div className="loading-state">Cargando inventario...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID Tipo</th>
                                <th>Nombre Articulo / Kit</th>
                                <th>Cantidad Disponible</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stock.length > 0 ? (
                                stock.map((s, index) => {
                                    const tipoAyudaId = s.tipo_ayuda_id ?? s.id_tipo_ayuda ?? 0;
                                    const nombreTipo = s.nombre_tipo ?? s.nombre ?? s.tipo_ayuda ?? 'Sin nombre';
                                    const cantidadDisponible = Number(s.cantidad_disponible ?? s.stock_disponible ?? 0);

                                    return (
                                    <tr key={tipoAyudaId || index}>
                                        <td className="fw-semibold">KIT-{String(tipoAyudaId).padStart(4, '0')}</td>
                                        <td>{nombreTipo}</td>
                                        <td>
                                            <span style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                                                {cantidadDisponible}
                                            </span>
                                        </td>
                                        <td>
                                            {cantidadDisponible > 100 ? (
                                                <span className="badge badge-success">Saludable</span>
                                            ) : cantidadDisponible > 0 ? (
                                                <span className="badge badge-warning">Stock Bajo</span>
                                            ) : (
                                                <span className="badge badge-error">Agotado</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" className="empty-state">No hay registros de inventario.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Registrar Ingreso de Lote</h3>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Tipo de Ayuda *</label>
                                    <select
                                        className="form-control"
                                        required
                                        value={formData.id_tipo_ayuda}
                                        onChange={(e) => setFormData({ ...formData, id_tipo_ayuda: e.target.value })}
                                    >
                                        <option value="">Seleccione tipo...</option>
                                        {stock.map((item) => {
                                            const tipoId = item.id_tipo_ayuda ?? item.tipo_ayuda_id;
                                            const nombreTipo = item.nombre_tipo ?? item.nombre ?? item.tipo_ayuda;
                                            return (
                                                <option key={tipoId} value={tipoId}>
                                                    {`KIT-${String(tipoId).padStart(4, '0')} - ${nombreTipo}`}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Numero de Lote *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={formData.numero_lote}
                                        onChange={(e) => setFormData({ ...formData, numero_lote: e.target.value })}
                                        placeholder="Ej: LOT-2026-001"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Fecha de Vencimiento</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.fecha_vencimiento}
                                        onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Observaciones</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={formData.observaciones}
                                        onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Guardar Ingreso
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventario;
