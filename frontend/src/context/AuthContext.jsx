import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('usuario');
            if (token && userData) {
                // Validación adicional contra el backend idealmente...
                setUsuario(JSON.parse(userData));
            }
            setLoading(false);
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
