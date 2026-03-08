import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Users, Package, ClipboardList, TrendingUp } from 'lucide-react';
import './Dashboard.css';

const Home = () => {
    const { usuario } = useContext(AuthContext);

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
                        <p className="stat-number">1,248</p>
                        <span className="stat-trend positive"><TrendingUp size={14} /> +12% este mes</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-green-light"><Package /></div>
                    <div className="stat-details">
                        <h3>Kits en Inventario</h3>
                        <p className="stat-number">450</p>
                        <span className="stat-trend neutral">Stock Saludable</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-purple-light"><ClipboardList /></div>
                    <div className="stat-details">
                        <h3>Entregas Realizadas</h3>
                        <p className="stat-number">3,892</p>
                        <span className="stat-trend positive"><TrendingUp size={14} /> +8% este mes</span>
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
                                <p><strong>Entrega registrada</strong> para Familia FAM-2026-89</p>
                                <span>Hace 5 minutos</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-bullet"></div>
                            <div className="activity-text">
                                <p><strong>Ingreso de inventario</strong>: 50 Kits de Aseo</p>
                                <span>Hace 2 horas</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-bullet"></div>
                            <div className="activity-text">
                                <p><strong>Nuevo censo</strong> registrado por Operador Juan</p>
                                <span>Ayer, 14:30</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <h3>Alertas del Sistema</h3>
                    <div className="alert-box warning">
                        <strong>Atención:</strong> Lote de Kits de Alimentos próximo a agotarse (15 restantes).
                    </div>
                    <div className="alert-box success">
                        <strong>Éxito:</strong> Copia de seguridad automática completada exitosamente.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
