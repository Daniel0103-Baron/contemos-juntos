import { useState, useEffect } from 'react';
import { ClipboardList, Plus, FileText, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import '../Familias/Familias.css';

const Entregas = () => {
    const [entregas, setEntregas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewFilename, setPreviewFilename] = useState('');
    const [previewLoading, setPreviewLoading] = useState(false);
    const [familias, setFamilias] = useState([]);
    const [lotes, setLotes] = useState([]);
    const [formData, setFormData] = useState({
        familia_id: '',
        periodo_entrega_id: null,
        observaciones: '',
        detalles: []
    });

    useEffect(() => {
        cargarEntregas();
        cargarFamilias();
        cargarLotes();
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                window.URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const cerrarPreview = () => {
        setShowPreviewModal(false);
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl('');
        setPreviewFilename('');
    };

    const cargarEntregas = async () => {
        try {
            const res = await api.get('/entregas');
            setEntregas(res.data);
        } catch (error) {
            console.error('Error cargando entregas:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarFamilias = async () => {
        try {
            const res = await api.get('/familias?disponibles=true');
            setFamilias(res.data);
        } catch (error) {
            console.error('Error cargando familias:', error);
        }
    };

    const cargarLotes = async () => {
        try {
            const res = await api.get('/inventario/lotes');
            setLotes(res.data);
        } catch (error) {
            console.error('Error cargando lotes:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.familia_id) {
            toast.error('Por favor seleccione una familia');
            return;
        }
        if (formData.detalles.length === 0) {
            toast.error('Por favor agregue al menos un lote a entregar');
            return;
        }

        try {
            await api.post('/entregas', formData);
            toast.success('Entrega registrada exitosamente');
            setShowModal(false);
            setFormData({
                familia_id: '',
                periodo_entrega_id: null,
                observaciones: '',
                detalles: []
            });
            cargarEntregas();
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.mensaje || 'Error al registrar entrega');
        }
    };

    const agregarDetalle = () => {
        setFormData({
            ...formData,
            detalles: [...formData.detalles, { lote_id: '', tipo_ayuda_id: 1, cantidad: 2 }]
        });
    };

    const actualizarDetalle = (index, campo, valor) => {
        const nuevosDetalles = [...formData.detalles];
        nuevosDetalles[index][campo] = valor;
        setFormData({ ...formData, detalles: nuevosDetalles });
    };

    const eliminarDetalle = (index) => {
        const nuevosDetalles = formData.detalles.filter((_, i) => i !== index);
        setFormData({ ...formData, detalles: nuevosDetalles });
    };

    const handleDescargarComprobante = async (id, numero) => {
        try {
            setPreviewLoading(true);
            const response = await api.get(`/reportes/comprobantes/${id}/pdf?t=${Date.now()}`, {
                responseType: 'blob',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            if (previewUrl) {
                window.URL.revokeObjectURL(previewUrl);
            }

            setPreviewFilename(`comprobante_${numero}.pdf`);
            setPreviewUrl(url);
            setShowPreviewModal(true);
        } catch (error) {
            console.error('Error al cargar vista previa del comprobante', error);
            toast.error('No se pudo cargar el comprobante.');
        } finally {
            setPreviewLoading(false);
        }
    };

    const descargarDesdePreview = () => {
        if (!previewUrl || !previewFilename) {
            return;
        }

        const link = document.createElement('a');
        link.href = previewUrl;
        link.setAttribute('download', previewFilename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="module-container">
            <div className="module-header">
                <div>
                    <h2>Registro de Entregas</h2>
                    <p>Gestione y despache las ayudas humanitarias a familias censadas.</p>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => {
                    const detallesIniciales = [];
                    const tiposVistos = new Set();
                    lotes.forEach(l => {
                        if (!tiposVistos.has(l.tipo_ayuda) && l.cantidad_disponible >= 2) {
                            tiposVistos.add(l.tipo_ayuda);
                            detallesIniciales.push({
                                lote_id: String(l.id_lote),
                                cantidad: 2
                            });
                        }
                    });
                    setFormData({
                        familia_id: '',
                        periodo_entrega_id: null,
                        observaciones: '',
                        detalles: detallesIniciales
                    });
                    setShowModal(true);
                }}>
                    <Plus size={18} /> Nueva Entrega
                </button>
            </div>

            <div className="card table-container" style={{ marginTop: '1rem' }}>
                {loading ? (
                    <div className="loading-state">Cargando historial de entregas...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Familia</th>
                                <th>Comprobante</th>
                                <th>Responsable</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entregas.length > 0 ? (
                                entregas.map(e => (
                                    <tr key={e.id}>
                                        <td>{new Date(e.fecha_entrega).toLocaleDateString()}</td>
                                        <td className="fw-semibold">{e.codigo_familia}</td>
                                        <td>
                                            <span className="badge badge-success" style={{ display: 'inline-flex', gap: '0.25rem' }}>
                                                <CheckCircle2 size={12} /> {e.numero_comprobante}
                                            </span>
                                        </td>
                                        <td>{e.operador}</td>
                                        <td>
                                            <span className={`badge ${e.estado === 'ENTREGADA' ? 'badge-success' : 'badge-warning'}`}>
                                                {e.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="btn-icon text-primary"
                                                    title="Ver Comprobante PDF"
                                                    onClick={() => handleDescargarComprobante(e.id, e.numero_comprobante)}
                                                    disabled={previewLoading}
                                                >
                                                    <FileText size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="empty-state">No se han registrado entregas aún.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Nueva Entrega */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" style={{maxWidth: '700px'}} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Nueva Entrega</h3>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Familia *</label>
                                    <select
                                        className="form-control"
                                        required
                                        value={formData.familia_id}
                                        onChange={(e) => setFormData({...formData, familia_id: e.target.value})}
                                    >
                                        <option value="">Seleccione una familia...</option>
                                        {familias.map(f => (
                                            <option key={f.id_familia} value={f.id_familia}>
                                                {f.codigo_familia} - {f.cabeza_nombres} {f.cabeza_apellidos}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Entregar Ayuda *</label>
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary btn-sm" 
                                        onClick={agregarDetalle}
                                        style={{marginBottom: '0.5rem'}}
                                    >
                                        <Plus size={16} /> Agregar Lote
                                    </button>
                                    
                                    {formData.detalles.map((detalle, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            gap: '0.5rem',
                                            marginBottom: '0.5rem',
                                            padding: '0.5rem',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0.375rem'
                                        }}>
                                            <select
                                                className="form-control"
                                                value={detalle.lote_id}
                                                onChange={(e) => actualizarDetalle(index, 'lote_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Seleccione lote...</option>
                                                {lotes.map(l => (
                                                    <option key={l.id_lote} value={l.id_lote}>
                                                        {l.numero_lote} - {l.tipo_ayuda} (Disp: {l.cantidad_disponible})
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Cantidad"
                                                min="1"
                                                value={detalle.cantidad}
                                                onChange={(e) => actualizarDetalle(index, 'cantidad', parseInt(e.target.value))}
                                                style={{width: '100px'}}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="btn-icon text-danger"
                                                onClick={() => eliminarDetalle(index)}
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="form-group">
                                    <label>Observaciones</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={formData.observaciones}
                                        onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Registrar Entrega
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPreviewModal && (
                <div className="modal-overlay" onClick={cerrarPreview}>
                    <div className="modal-content pdf-preview-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Vista previa del comprobante</h3>
                            <button className="btn-icon" onClick={cerrarPreview}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body pdf-preview-body">
                            {previewUrl ? (
                                <iframe
                                    title="Vista previa PDF"
                                    src={previewUrl}
                                    className="pdf-preview-frame"
                                />
                            ) : (
                                <div className="loading-state">Cargando vista previa...</div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={cerrarPreview}>
                                Cerrar
                            </button>
                            <button type="button" className="btn btn-primary" onClick={descargarDesdePreview}>
                                Descargar PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Entregas;
