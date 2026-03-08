const express = require('express');
const cors = require('cors');
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

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ mensaje: 'Error interno del servidor', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
