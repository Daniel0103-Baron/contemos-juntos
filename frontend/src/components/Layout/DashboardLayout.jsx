import { useState, useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { usuario, loading } = useContext(AuthContext);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Mientras verifica la sesión, mostrar pantalla de carga en lugar de negro
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: 'var(--bg-primary, #0f1117)',
                color: 'white',
                fontSize: '1rem',
                gap: '12px'
            }}>
                <div style={{
                    width: '24px', height: '24px',
                    border: '3px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#6c63ff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }} />
                Cargando sesión...
            </div>
        );
    }

    // Si no hay usuario autenticado, redirigir al login
    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="layout-container">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="layout-main">
                <Header toggleSidebar={toggleSidebar} />
                <main className="layout-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
