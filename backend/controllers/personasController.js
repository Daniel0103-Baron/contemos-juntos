const pool = require('../config/db');

const getPersonasByFamilia = async (req, res) => {
    try {
        const { familia_id } = req.params;
        const [rows] = await pool.query('SELECT * FROM personas WHERE id_familia = ? ORDER BY es_jefe_hogar DESC, fecha_nacimiento ASC', [familia_id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener personas de la familia' });
    }
};

const createPersona = async (req, res) => {
    try {
        const { id_familia, tipo_documento, numero_documento, nombres, apellidos, fecha_nacimiento, sexo, parentesco, es_jefe_hogar, telefono } = req.body;

        // Validación de campos requeridos
        if (!id_familia || !tipo_documento || !numero_documento || !nombres || !apellidos) {
            return res.status(400).json({ mensaje: 'Los campos: id_familia, tipo_documento, numero_documento, nombres y apellidos son requeridos' });
        }

        // Validar que no sean solo espacios
        if (numero_documento.trim().length === 0 || nombres.trim().length === 0 || apellidos.trim().length === 0) {
            return res.status(400).json({ mensaje: 'Los campos no pueden estar vacíos' });
        }

        // Validar documento
        if (numero_documento.trim().length < 5) {
            return res.status(400).json({ mensaje: 'El documento debe tener al menos 5 caracteres' });
        }

        if (nombres.trim().length < 3) {
            return res.status(400).json({ mensaje: 'El nombre debe tener al menos 3 caracteres' });
        }

        if (apellidos.trim().length < 3) {
            return res.status(400).json({ mensaje: 'El apellido debe tener al menos 3 caracteres' });
        }

        // Un solo jefe de hogar por familia permitido
        if (es_jefe_hogar) {
            await pool.query('UPDATE personas SET es_jefe_hogar = FALSE WHERE id_familia = ?', [id_familia]);
        }

        const [result] = await pool.query(
            'INSERT INTO personas (id_familia, tipo_documento, numero_documento, nombres, apellidos, fecha_nacimiento, sexo, parentesco, es_jefe_hogar, telefono) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id_familia, tipo_documento.trim(), numero_documento.trim(), nombres.trim(), apellidos.trim(), fecha_nacimiento || null, sexo || null, parentesco || null, es_jefe_hogar || false, telefono || null]
        );

        res.status(201).json({ mensaje: 'Persona registrada con éxito', id: result.insertId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ mensaje: 'El documento ya está registrado' });
        }
        res.status(500).json({ mensaje: 'Error al registrar persona' });
    }
};

const deletePersona = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM personas WHERE id_persona = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Persona no encontrada' });
        res.json({ mensaje: 'Persona eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar persona' });
    }
};

module.exports = {
    getPersonasByFamilia,
    createPersona,
    deletePersona
};
