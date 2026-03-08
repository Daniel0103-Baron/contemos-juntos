const pool = require('../config/db');

const getFamilias = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM familias ORDER BY id_familia DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener familias' });
    }
};

const getFamiliaById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM familias WHERE id_familia = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ mensaje: 'Familia no encontrada' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener familia' });
    }
};

const createFamilia = async (req, res) => {
    try {
        const { codigo_familia, direccion, barrio, municipio, departamento, telefono_contacto, numero_integrantes, nivel_vulnerabilidad, observaciones } = req.body;

        // Validación de campos requeridos
        if (!codigo_familia || !direccion || !numero_integrantes) {
            return res.status(400).json({ mensaje: 'Código de familia, dirección y número de integrantes son requeridos' });
        }

        // Validar que los campos no sean solo espacios en blanco
        if (codigo_familia.trim().length === 0 || direccion.trim().length === 0) {
            return res.status(400).json({ mensaje: 'Los campos requeridos no pueden estar vacíos' });
        }

        // Validación de longitudes mínimas
        if (codigo_familia.trim().length < 3) {
            return res.status(400).json({ mensaje: 'El código de familia debe tener al menos 3 caracteres' });
        }

        if (direccion.trim().length < 5) {
            return res.status(400).json({ mensaje: 'La dirección debe tener al menos 5 caracteres' });
        }

        // Validar número de integrantes
        if (isNaN(numero_integrantes) || numero_integrantes < 1) {
            return res.status(400).json({ mensaje: 'El número de integrantes debe ser al menos 1' });
        }

        // Validación de existencia
        const [existente] = await pool.query('SELECT id_familia FROM familias WHERE codigo_familia = ?', [codigo_familia.trim()]);
        if (existente.length > 0) {
            return res.status(400).json({ mensaje: 'Ya existe una familia con ese código' });
        }

        const [result] = await pool.query(
            'INSERT INTO familias (codigo_familia, direccion, barrio, municipio, departamento, telefono_contacto, numero_integrantes, nivel_vulnerabilidad, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [codigo_familia.trim(), direccion.trim(), barrio || null, municipio || null, departamento || null, telefono_contacto || null, numero_integrantes, nivel_vulnerabilidad || null, observaciones || null]
        );

        res.status(201).json({ mensaje: 'Familia registrada con éxito', id: result.insertId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ mensaje: 'Ya existe una familia con ese código' });
        }
        res.status(500).json({ mensaje: 'Error al registrar familia' });
    }
};

const updateFamilia = async (req, res) => {
    try {
        const { id } = req.params;
        const { direccion, barrio, municipio, departamento, telefono_contacto, numero_integrantes, nivel_vulnerabilidad, observaciones } = req.body;

        const [result] = await pool.query(
            'UPDATE familias SET direccion = ?, barrio = ?, municipio = ?, departamento = ?, telefono_contacto = ?, numero_integrantes = ?, nivel_vulnerabilidad = ?, observaciones = ? WHERE id_familia = ?',
            [direccion, barrio, municipio, departamento, telefono_contacto, numero_integrantes, nivel_vulnerabilidad, observaciones, id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Familia no encontrada' });

        res.json({ mensaje: 'Familia actualizada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar familia' });
    }
};

module.exports = {
    getFamilias,
    getFamiliaById,
    createFamilia,
    updateFamilia
};
