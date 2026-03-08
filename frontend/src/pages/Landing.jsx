import { Link } from 'react-router-dom';
import { Heart, Activity, ShieldCheck, ArrowRight } from 'lucide-react';
import './Landing.css';

const Landing = () => {
    return (
        <div className="landing-container">
            {/* Navbar */}
            <nav className="landing-nav container">
                <div className="logo-section">
                    <Heart className="logo-icon" size={32} />
                    <span className="logo-text">Contemos Juntos</span>
                </div>
                <div className="nav-actions">
                    <Link to="/login" className="btn btn-primary">
                        Iniciar Sesión <ArrowRight size={16} />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="container hero-content">
                    <div className="hero-text">
                        <span className="badge">Sistema de Trazabilidad</span>
                        <h1 className="hero-title">
                            Gestión transparente de <span>Ayudas Humanitarias</span>
                        </h1>
                        <p className="hero-description">
                            Plataforma integral para el control de inventario, prevención de duplicidades,
                            y auditoría de entregas para familias vulnerables.
                        </p>
                        <div className="hero-cta">
                            <Link to="/login" className="btn btn-primary btn-lg">
                                Acceder al Portal
                            </Link>
                            <a href="#caracteristicas" className="btn btn-secondary btn-lg">
                                Conoce Más
                            </a>
                        </div>
                    </div>
                    <div className="hero-visual">
                        {/* Placeholder visual moderno */}
                        <div className="visual-card">
                            <div className="visual-header">Estado de Entregas</div>
                            <div className="visual-body">
                                <div className="stat-row">
                                    <span>Familias Atendidas</span>
                                    <span className="stat-value">1,240</span>
                                </div>
                                <div className="stat-bar"><div className="stat-fill" style={{ width: '75%' }}></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="caracteristicas" className="features bg-light">
                <div className="container">
                    <h2 className="section-title">El poder de la transparencia</h2>
                    <div className="grid-features">
                        <div className="feature-card">
                            <div className="feature-icon"><Activity /></div>
                            <h3>Control de Inventario</h3>
                            <p>Trazabilidad en tiempo real de entradas y salidas de ayudas humanitarias por lote.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><ShieldCheck /></div>
                            <h3>Prevención de Duplicidad</h3>
                            <p>Validaciones estrictas para asegurar distribución justa y equitativa por núcleo familiar.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><Heart /></div>
                            <h3>Reportes y Auditoría</h3>
                            <p>Generación de comprobantes y exportación en PDF para entes reguladores.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Contemos Juntos - Sistema de Control y Trazabilidad de Ayudas Humanitarias.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
