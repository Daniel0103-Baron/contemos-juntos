import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, X } from 'lucide-react';
import api from '../../services/api';
import './Familias.css';

const INITIAL_FORM_DATA = {
    codigo_familia: '',
    direccion: '',
    barrio: '',
    municipio: '',
    departamento: '',
    telefono_contacto: '',
    numero_integrantes: 1,
    grupo_sisben: '',
    observaciones: '',
    cabeza_nombres: '',
    cabeza_apellidos: '',
    cabeza_documento: ''
};

const Familias = () => {
    const [familias, setFamilias] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [modalMode, setModalMode] = useState('create');
    const [selectedFamiliaId, setSelectedFamiliaId] = useState(null);

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

    const mapFamiliaToFormData = (familia) => ({
        codigo_familia: familia.codigo_familia || '',
        direccion: familia.direccion || '',
        barrio: familia.barrio || '',
        municipio: familia.municipio || '',
        departamento: familia.departamento || '',
        telefono_contacto: familia.telefono_contacto || '',
        numero_integrantes: Number(familia.numero_integrantes) || 1,
        grupo_sisben: familia.grupo_sisben || '',
        observaciones: familia.observaciones || ''
    });

    const abrirModalNuevaFamilia = () => {
        setModalMode('create');
        setSelectedFamiliaId(null);
        setFormData(INITIAL_FORM_DATA);
        setShowModal(true);
    };

    const abrirModalFamilia = async (idFamilia, mode) => {
        try {
            const res = await api.get(`/familias/${idFamilia}`);
            setFormData(mapFamiliaToFormData(res.data));
            setSelectedFamiliaId(idFamilia);
            setModalMode(mode);
            setShowModal(true);
        } catch (error) {
            console.error('Error cargando familia:', error);
            alert(error.response?.data?.mensaje || 'Error al cargar los datos de la familia');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'edit' && selectedFamiliaId) {
                await api.put(`/familias/${selectedFamiliaId}`, formData);
                alert('Familia actualizada correctamente');
            } else {
                await api.post('/familias', formData);
                alert('Familia registrada exitosamente');
            }

            setShowModal(false);
            setFormData(INITIAL_FORM_DATA);
            setSelectedFamiliaId(null);
            setModalMode('create');
            cargarFamilias();
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.mensaje || 'Error al guardar la familia');
        }
    };

    const familiasFiltradas = familias.filter(f =>
        f.codigo_familia?.toLowerCase().includes(busqueda.toLowerCase()) ||
        f.direccion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        f.barrio?.toLowerCase().includes(busqueda.toLowerCase())
    );

    const isViewMode = modalMode === 'view';
    const isEditMode = modalMode === 'edit';

    const modalTitle = isViewMode
        ? 'Detalle de Familia'
        : isEditMode
            ? 'Editar Familia'
            : 'Nueva Familia';

    return (
        <div className="module-container">
            <div className="module-header">
                <div>
                    <h2>Gestión de Familias y Censos</h2>
                    <p>Administre los núcleos familiares receptores de ayudas.</p>
                </div>
                <button className="btn btn-primary" onClick={abrirModalNuevaFamilia}>
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
                                <th>Jefe de Hogar</th>
                                <th>Sisbén</th>
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
                                        <td>{f.cabeza_nombres ? `${f.cabeza_nombres} ${f.cabeza_apellidos || ''}` : 'Sin asignar'}</td>
                                        <td><span className="badge badge-info">{f.grupo_sisben || 'N/A'}</span></td>
                                        <td>{f.numero_integrantes}</td>
                                        <td>{f.direccion}</td>
                                        <td>
                                            <span className="badge badge-success">{f.estado || 'ACTIVA'}</span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="btn-icon text-primary"
                                                    title="Ver Detalle"
                                                    onClick={() => abrirModalFamilia(f.id_familia, 'view')}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    className="btn-icon text-info"
                                                    title="Editar"
                                                    onClick={() => abrirModalFamilia(f.id_familia, 'edit')}
                                                >
                                                    <Edit size={18} />
                                                </button>
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
                            <h3>{modalTitle}</h3>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    {!isEditMode && !isViewMode ? null : (
                                        <div className="form-group">
                                            <label>Código de Familia *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                required
                                                value={formData.codigo_familia}
                                                onChange={(e) => setFormData({...formData, codigo_familia: e.target.value})}
                                                disabled={true}
                                            />
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Número de Integrantes *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            required
                                            min="1"
                                            value={formData.numero_integrantes}
                                            onChange={(e) => setFormData({...formData, numero_integrantes: Number(e.target.value) || 1})}
                                            disabled={isViewMode}
                                        />
                                    </div>
                                </div>

                                {!isEditMode && !isViewMode && (
                                    <>
                                        <h4 style={{marginTop: '15px', marginBottom: '10px'}}>Datos del Jefe de Hogar</h4>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Número de Cédula *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    required
                                                    pattern="[0-9]{6,11}"
                                                    title="La cédula debe tener entre 6 y 11 números"
                                                    value={formData.cabeza_documento}
                                                    onChange={(e) => {
                                                        const soloNumeros = e.target.value.replace(/[^0-9]/g, '');
                                                        setFormData({...formData, cabeza_documento: soloNumeros});
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Nombres *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    required
                                                    value={formData.cabeza_nombres}
                                                    onChange={(e) => setFormData({...formData, cabeza_nombres: e.target.value})}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Apellidos *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    required
                                                    value={formData.cabeza_apellidos}
                                                    onChange={(e) => setFormData({...formData, cabeza_apellidos: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="form-group">
                                    <label>Dirección *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={formData.direccion}
                                        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                                            disabled={isViewMode}
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
                                            disabled={isViewMode}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Municipio</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.municipio}
                                            onChange={(e) => setFormData({...formData, municipio: e.target.value})}
                                            disabled={isViewMode}
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
                                            disabled={isViewMode}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Teléfono de Contacto</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.telefono_contacto}
                                            onChange={(e) => setFormData({...formData, telefono_contacto: e.target.value})}
                                            disabled={isViewMode}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Grupo Sisbén *</label>
                                    <select
                                        className="form-control"
                                        required
                                        value={formData.grupo_sisben}
                                        onChange={(e) => setFormData({...formData, grupo_sisben: e.target.value})}
                                        disabled={isViewMode}
                                    >
                                        <option value="">Seleccione un grupo...</option>
                                        <optgroup label="Grupo A (Pobreza Extrema)">
                                            {Array.from({length: 5}, (_, i) => `A${i + 1}`).map(g => <option key={g} value={g}>{g}</option>)}
                                        </optgroup>
                                        <optgroup label="Grupo B (Pobreza Moderada)">
                                            {Array.from({length: 7}, (_, i) => `B${i + 1}`).map(g => <option key={g} value={g}>{g}</option>)}
                                        </optgroup>
                                        <optgroup label="Grupo C (Vulnerable)">
                                            {Array.from({length: 18}, (_, i) => `C${i + 1}`).map(g => <option key={g} value={g}>{g}</option>)}
                                        </optgroup>
                                        <optgroup label="Grupo D (No Pobre)">
                                            {Array.from({length: 21}, (_, i) => `D${i + 1}`).map(g => <option key={g} value={g}>{g}</option>)}
                                        </optgroup>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Observaciones</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={formData.observaciones}
                                        onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                                        disabled={isViewMode}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    {isViewMode ? 'Cerrar' : 'Cancelar'}
                                </button>
                                {!isViewMode && (
                                    <button type="submit" className="btn btn-primary">
                                        {isEditMode ? 'Guardar Cambios' : 'Registrar Familia'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Familias;
