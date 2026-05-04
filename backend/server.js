const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/familias', require('./routes/familiasRoutes'));
app.use('/api/personas', require('./routes/personasRoutes'));
app.use('/api/censos', require('./routes/censosRoutes'));
app.use('/api/inventario', require('./routes/inventarioRoutes'));
app.use('/api/entregas', require('./routes/entregasRoutes'));
app.use('/api/reportes', require('./routes/reportesRoutes'));

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

