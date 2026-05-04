import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            try {
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('usuario');
                if (token && userData) {
                    const parsed = JSON.parse(userData);
                    setUsuario(parsed);
                }
            } catch (e) {
                // Si los datos de localStorage están corruptos, limpiar y continuar
                console.warn('Sesión inválida, limpiando localStorage:', e);
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (credenciales) => {
        try {
            const res = await api.post('/auth/login', credenciales);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
            setUsuario(res.data.usuario);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                mensaje: error.response?.data?.mensaje || 'Error al conectar con el servidor'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
