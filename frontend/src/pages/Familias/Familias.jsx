import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, ShieldAlert, X } from 'lucide-react';
import api from '../../services/api';
import './Familias.css';

const Familias = () => {
    const [familias, setFamilias] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        codigo_familia: '',
        direccion: '',
        barrio: '',
        municipio: '',
        departamento: '',
        telefono_contacto: '',
        numero_integrantes: 1,
        nivel_vulnerabilidad: '',
        observaciones: ''
    });

    useEffect(() => {
        cargarFamilias();
    }, []);

    const cargarFamilias = async () => {
        try {
            const res = await api.get('/familias');
            setFamilias(res.data);
        } catch (error) {
            console.error('Error cargando familias:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/familias', formData);
            alert('Familia registrada exitosamente');
            setShowModal(false);
            setFormData({
                codigo_familia: '',
                direccion: '',
                barrio: '',
                municipio: '',
                departamento: '',
                telefono_contacto: '',
                numero_integrantes: 1,
                nivel_vulnerabilidad: '',
                observaciones: ''
            });
            cargarFamilias();
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.mensaje || 'Error al registrar familia');
        }
    };

    const familiasFiltradas = familias.filter(f =>
        f.codigo_familia?.toLowerCase().includes(busqueda.toLowerCase()) ||
        f.direccion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        f.barrio?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="module-container">
            <div className="module-header">
                <div>
                    <h2>Gestión de Familias y Censos</h2>
                    <p>Administre los núcleos familiares receptores de ayudas.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Nueva Familia
                </button>
            </div>

            <div className="card toolbar">
                <div className="search-bar">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por código, documento o nombre..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="form-control"
                    />
                </div>
                {/* Posibles filtros en el futuro */}
            </div>

            <div className="card table-container">
                {loading ? (
                    <div className="loading-state">Cargando datos...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Barrio</th>
                                <th>N° Integrantes</th>
                                <th>Dirección</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {familiasFiltradas.length > 0 ? (
                                familiasFiltradas.map(f => (
                                    <tr key={f.id_familia}>
                                        <td className="fw-semibold">{f.codigo_familia}</td>
                                        <td>{f.barrio || 'N/A'}</td>
                                        <td>{f.numero_integrantes}</td>
                                        <td>{f.direccion}</td>
                                        <td>
                                            <span className="badge badge-success">{f.estado || 'ACTIVA'}</span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn-icon text-primary" title="Ver Detalle"><Eye size={18} /></button>
                                                <button className="btn-icon text-info" title="Editar"><Edit size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="empty-state">No se encontraron familias.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Nueva Familia */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Nueva Familia</h3>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Código de Familia *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={formData.codigo_familia}
                                            onChange={(e) => setFormData({...formData, codigo_familia: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Número de Integrantes *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            required
                                            min="1"
                                            value={formData.numero_integrantes}
                                            onChange={(e) => setFormData({...formData, numero_integrantes: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Dirección *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={formData.direccion}
                                        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Barrio</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.barrio}
                                            onChange={(e) => setFormData({...formData, barrio: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Municipio</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.municipio}
                                            onChange={(e) => setFormData({...formData, municipio: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Departamento</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.departamento}
                                            onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Teléfono de Contacto</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.telefono_contacto}
                                            onChange={(e) => setFormData({...formData, telefono_contacto: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Nivel de Vulnerabilidad</label>
                                    <select
                                        className="form-control"
                                        value={formData.nivel_vulnerabilidad}
                                        onChange={(e) => setFormData({...formData, nivel_vulnerabilidad: e.target.value})}
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="ALTO">Alto</option>
                                        <option value="MEDIO">Medio</option>
                                        <option value="BAJO">Bajo</option>
                                    </select>
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
                                    Registrar Familia
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Familias;
