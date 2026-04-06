import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Users, Package, ClipboardList } from 'lucide-react';
import api from '../../services/api';
import './Dashboard.css';

const Home = () => {
    const { usuario } = useContext(AuthContext);
    const [inventarioTipos, setInventarioTipos] = useState([]);
    const [lotesDisponibles, setLotesDisponibles] = useState([]);
    const [entregas, setEntregas] = useState([]);
    const [familias, setFamilias] = useState([]);
    const [loadingAlertas, setLoadingAlertas] = useState(true);

    useEffect(() => {
        const cargarAlertas = async () => {
            try {
                const [familiasRes, inventarioRes, lotesRes, entregasRes] = await Promise.all([
                    api.get('/familias'),
                    api.get('/inventario'),
                    api.get('/inventario/lotes'),
                    api.get('/entregas')
                ]);

                setFamilias(familiasRes.data || []);
                setInventarioTipos(inventarioRes.data || []);
                setLotesDisponibles(lotesRes.data || []);
                setEntregas(entregasRes.data || []);
            } catch (error) {
                console.error('Error cargando alertas del dashboard:', error);
            } finally {
                setLoadingAlertas(false);
            }
        };

        cargarAlertas();
    }, []);

    const alertas = useMemo(() => {
        const items = [];

        const stockBajo = inventarioTipos
            .filter((tipo) => Number(tipo.cantidad_disponible || 0) <= 2)
            .sort((a, b) => Number(a.cantidad_disponible || 0) - Number(b.cantidad_disponible || 0));

        if (stockBajo.length > 0) {
            const primerTipo = stockBajo[0];
            items.push({
                tipo: 'warning',
                titulo: 'Atencion',
                mensaje: `${primerTipo.nombre_tipo} con stock critico (${primerTipo.cantidad_disponible} lotes disponibles).`
            });
        }

        const hoy = new Date();
        const ms30Dias = 30 * 24 * 60 * 60 * 1000;
        const lotesPorVencer = lotesDisponibles
            .filter((lote) => lote.fecha_vencimiento)
            .map((lote) => ({
                ...lote,
                fechaVencimientoDate: new Date(lote.fecha_vencimiento)
            }))
            .filter((lote) => lote.fechaVencimientoDate.getTime() >= hoy.getTime() && (lote.fechaVencimientoDate.getTime() - hoy.getTime()) <= ms30Dias)
            .sort((a, b) => a.fechaVencimientoDate.getTime() - b.fechaVencimientoDate.getTime());

        if (lotesPorVencer.length > 0) {
            const lote = lotesPorVencer[0];
            items.push({
                tipo: 'warning',
                titulo: 'Prevencion',
                mensaje: `Lote ${lote.numero_lote} (${lote.tipo_ayuda}) vence pronto: ${lote.fechaVencimientoDate.toLocaleDateString()}.`
            });
        }

        if (entregas.length > 0) {
            const ultimaEntrega = entregas[0];
            items.push({
                tipo: 'success',
                titulo: 'Actividad',
                mensaje: `Ultima entrega registrada: ${ultimaEntrega.numero_comprobante} para ${ultimaEntrega.codigo_familia}.`
            });
        }

        if (items.length === 0) {
            items.push({
                tipo: 'success',
                titulo: 'Sin novedades',
                mensaje: 'No hay alertas criticas activas en este momento.'
            });
        }

        return items;
    }, [inventarioTipos, lotesDisponibles, entregas]);

    const totalFamilias = familias.length;
    const totalKits = inventarioTipos.reduce((acc, tipo) => acc + Number(tipo.cantidad_disponible || 0), 0);
    const totalEntregas = entregas.length;

    const estadoInventario = totalKits === 0
        ? 'Sin stock disponible'
        : totalKits <= 5
            ? 'Stock critico'
            : 'Stock saludable';

    const ultimaEntrega = entregas[0];
    const ultimaFamilia = familias[0];
    const loteMasReciente = lotesDisponibles[0];

    return (
        <div className="dashboard-home">
            <div className="welcome-banner">
                <div>
                    <h2 className="welcome-title">Bienvenido de nuevo, {usuario?.nombre || 'Administrador'}</h2>
                    <p className="welcome-subtitle">Aquí hay un resumen de las actividades del sistema hoy.</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon bg-blue-light"><Users /></div>
                    <div className="stat-details">
                        <h3>Familias Censadas</h3>
                        <p className="stat-number">{totalFamilias.toLocaleString('es-CO')}</p>
                        <span className="stat-trend neutral">{totalFamilias > 0 ? 'Registros activos en BD' : 'Sin registros'}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-green-light"><Package /></div>
                    <div className="stat-details">
                        <h3>Kits en Inventario</h3>
                        <p className="stat-number">{totalKits.toLocaleString('es-CO')}</p>
                        <span className={`stat-trend ${totalKits <= 5 ? 'negative' : 'neutral'}`}>{estadoInventario}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-purple-light"><ClipboardList /></div>
                    <div className="stat-details">
                        <h3>Entregas Realizadas</h3>
                        <p className="stat-number">{totalEntregas.toLocaleString('es-CO')}</p>
                        <span className="stat-trend neutral">{totalEntregas > 0 ? 'Historial acumulado' : 'Sin entregas registradas'}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-content-grid">
                <div className="card">
                    <h3>Actividad Reciente</h3>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-bullet"></div>
                            <div className="activity-text">
                                {ultimaEntrega ? (
                                    <>
                                        <p><strong>Entrega registrada</strong> para {ultimaEntrega.codigo_familia}</p>
                                        <span>{new Date(ultimaEntrega.fecha_entrega).toLocaleString('es-CO')}</span>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Sin entregas recientes</strong></p>
                                        <span>No hay movimientos registrados</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-bullet"></div>
                            <div className="activity-text">
                                {loteMasReciente ? (
                                    <>
                                        <p><strong>Lote disponible</strong>: {loteMasReciente.numero_lote} ({loteMasReciente.tipo_ayuda})</p>
                                        <span>Estado: {loteMasReciente.estado}</span>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Inventario sin lotes</strong></p>
                                        <span>No hay lotes disponibles</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-bullet"></div>
                            <div className="activity-text">
                                {ultimaFamilia ? (
                                    <>
                                        <p><strong>Ultima familia registrada</strong>: {ultimaFamilia.codigo_familia}</p>
                                        <span>{ultimaFamilia.barrio || ultimaFamilia.direccion || 'Sin ubicacion registrada'}</span>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Sin censos recientes</strong></p>
                                        <span>No hay familias registradas</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <h3>Alertas del Sistema</h3>
                    {loadingAlertas ? (
                        <div className="alert-box info">
                            Cargando alertas reales...
                        </div>
                    ) : (
                        alertas.map((alerta, index) => (
                            <div key={`${alerta.tipo}-${index}`} className={`alert-box ${alerta.tipo}`}>
                                <strong>{alerta.titulo}:</strong> {alerta.mensaje}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
