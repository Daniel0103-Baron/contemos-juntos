const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const https = require('https');
const http = require('http');
require('dotenv').config();

const app = express();

// ========================================================
// SEGURIDAD: Helmet - Cabeceras HTTP seguras
// ========================================================
app.use(helmet());

// ========================================================
// SEGURIDAD: CORS - Solo permite el frontend oficial
// ========================================================
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL // URL de Render en producción
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Permitir peticiones sin origin (ej: Postman, apps móviles)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

// ========================================================
// SEGURIDAD: Rate Limiting - Anti fuerza bruta en login
// ========================================================
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 intentos por IP en 15 min
    message: { mensaje: 'Demasiados intentos. Intente de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Limiter general para toda la API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { mensaje: 'Demasiadas solicitudes. Intente más tarde.' }
});

// Rutas (con rate limiting aplicado)
app.use('/api/auth', loginLimiter, require('./routes/authRoutes'));
app.use('/api/familias', apiLimiter, require('./routes/familiasRoutes'));
app.use('/api/personas', apiLimiter, require('./routes/personasRoutes'));
app.use('/api/censos', apiLimiter, require('./routes/censosRoutes'));
app.use('/api/inventario', apiLimiter, require('./routes/inventarioRoutes'));
app.use('/api/entregas', apiLimiter, require('./routes/entregasRoutes'));
app.use('/api/reportes', apiLimiter, require('./routes/reportesRoutes'));

app.get('/', (req, res) => {
    res.json({ message: 'API del Sistema de Control y Trazabilidad de Ayudas Humanitarias' });
});

// Endpoint de salud para el keep-alive
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ mensaje: 'Error interno del servidor', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);

    // ========================================================
    // KEEP-ALIVE: Evita el "cold start" de Render
    // Hace un ping cada 12 minutos para mantener el servidor activo
    // ========================================================
    const RENDER_URL = process.env.RENDER_EXTERNAL_URL;

    if (RENDER_URL) {
        const pingInterval = 12 * 60 * 1000; // 12 minutos en milisegundos
        const url = `${RENDER_URL}/health`;
        const client = url.startsWith('https') ? https : http;

        setInterval(() => {
            client.get(url, (res) => {
                console.log(`[Keep-Alive] Ping enviado a ${url} - Status: ${res.statusCode}`);
            }).on('error', (err) => {
                console.error(`[Keep-Alive] Error en ping: ${err.message}`);
            });
        }, pingInterval);

        console.log(`[Keep-Alive] Activado. Ping cada 12 min a ${url}`);
    } else {
        console.log('[Keep-Alive] RENDER_EXTERNAL_URL no definida - modo local, keep-alive desactivado.');
    }
});

