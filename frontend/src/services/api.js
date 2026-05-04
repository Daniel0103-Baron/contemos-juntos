import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Asegurar que sea el puerto de nuestro backend
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para inyectar token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
    response => response,
    error => {
        // Manejo de errores específicos
        if (error.response?.status === 401) {
            // Si ya estamos en login, no redirigir (es un intento de login fallido)
            if (window.location.pathname !== '/login') {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        if (error.response?.status === 403) {
            return Promise.reject({
                ...error,
                mensaje: 'No tienes permisos para realizar esta acción.'
            });
        }

        if (error.response?.status === 404) {
            return Promise.reject({
                ...error,
                mensaje: 'El recurso solicitado no fue encontrado.'
            });
        }

        if (error.response?.status === 500) {
            return Promise.reject({
                ...error,
                mensaje: 'Error interno del servidor. Por favor, intenta más tarde.'
            });
        }

        if (!error.response) {
            return Promise.reject({
                ...error,
                mensaje: 'Error de conexión. Verifica tu conexión a internet.'
            });
        }

        return Promise.reject(error);
    }
);

export default api;

