import { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, FileText, ClipboardList,
    PackageSearch, Package, ShieldAlert, LogOut, Menu, X, Heart
} from 'lucide-react';

const MENU_ITEMS = {
    1: [ // Administrador
        { path: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
        { path: '/dashboard/familias', icon: Users, label: 'Familias y Censos' },
        { path: '/dashboard/inventario', icon: Package, label: 'Inventario' },
        { path: '/dashboard/entregas', icon: ClipboardList, label: 'Entregas' },
        { path: '/dashboard/reportes', icon: FileText, label: 'Reportes' },
        { path: '/dashboard/auditoria', icon: ShieldAlert, label: 'Auditoría' },
    ],
    2: [ // Usuario / Operador
        { path: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
        { path: '/dashboard/familias', icon: Users, label: 'Familias' },
        { path: '/dashboard/entregas', icon: ClipboardList, label: 'Entregas' },
    ],
    3: [ // Donante
        { path: '/dashboard', icon: LayoutDashboard, label: 'Impacto' },
        { path: '/dashboard/mis-donaciones', icon: Heart, label: 'Mis Donaciones' },
    ],
    4: [ // Auditor
        { path: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
        { path: '/dashboard/reportes', icon: FileText, label: 'Reportes y Exportación' },
        { path: '/dashboard/auditoria', icon: ShieldAlert, label: 'Bitácora' },
    ]
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { usuario, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Default to admin if no user testing fallback
    const roleId = usuario?.rol_id || 1;
    const roleItems = MENU_ITEMS[roleId] || MENU_ITEMS[2];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <div className={`sidebar-backdrop ${isOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <Heart className="sidebar-logo-icon" size={24} />
                    <span className="sidebar-brand">Contemos Juntos</span>
                    <button className="sidebar-close md-hidden" onClick={toggleSidebar}>
                        <X size={20} />
                    </button>
                </div>

                <div className="sidebar-usercard">
                    <div className="avatar">{usuario?.nombre?.charAt(0) || 'U'}</div>
                    <div className="user-info">
                        <span className="user-name">{usuario?.nombre || 'Administrador'}</span>
                        <span className="user-role">Rol ID: {roleId}</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {roleItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/dashboard'}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => {
                                if (window.innerWidth < 768) toggleSidebar();
                            }}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item btn-logout" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
