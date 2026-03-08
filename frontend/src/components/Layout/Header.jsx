import { Menu } from 'lucide-react';

const Header = ({ toggleSidebar, title }) => {
    return (
        <header className="dashboard-header">
            <div className="header-left">
                <button className="menu-trigger" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
                <h1 className="header-title">{title || 'Panel de Control'}</h1>
            </div>
            <div className="header-right">
                {/* Posible espacio para notificaciones o selector de idioma */}
            </div>
        </header>
    );
};

export default Header;
