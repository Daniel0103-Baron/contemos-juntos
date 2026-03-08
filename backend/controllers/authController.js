const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { usuario, password } = req.body;

        if (!usuario || !password) {
            return res.status(400).json({ mensaje: 'Por favor, proporcione usuario/correo y contraseña' });
        }

        // Validación adicional de campos
        const usuarioTrimmed = usuario.trim();
        const passwordTrimmed = password.trim();

        if (usuarioTrimmed.length === 0 || passwordTrimmed.length === 0) {
            return res.status(400).json({ mensaje: 'Usuario y contraseña no pueden estar vacíos' });
        }

        if (usuarioTrimmed.length < 3) {
            return res.status(400).json({ mensaje: 'Usuario debe tener al menos 3 caracteres' });
        }

        // Buscar por correo (estructura actual de BD)
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ? LIMIT 1', [usuarioTrimmed]);

        if (rows.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        const user = rows[0];

        // Comparar password - están en texto plano en la BD
        const accesoPermitido = passwordTrimmed === user.password_hash;

        if (!accesoPermitido) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        const payload = {
            id: user.id_usuario,
            rol_id: user.id_rol,
            nombre: user.nombre_completo
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: payload
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor en el login' });
    }
};

module.exports = { login };
