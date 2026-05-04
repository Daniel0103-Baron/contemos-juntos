const pool = require('../config/db');

const getFamilias = async (req, res) => {
    try {
        const { disponibles } = req.query;
        let query = `
            SELECT f.*, p.nombres AS cabeza_nombres, p.apellidos AS cabeza_apellidos
            FROM familias f
            LEFT JOIN personas p ON f.id_familia = p.id_familia AND p.es_jefe_hogar = TRUE
            ORDER BY f.id_familia DESC
        `;
        if (disponibles === 'true') {
            query = `
                SELECT f.*, p.nombres AS cabeza_nombres, p.apellidos AS cabeza_apellidos
                FROM familias f
                LEFT JOIN personas p ON f.id_familia = p.id_familia AND p.es_jefe_hogar = TRUE
                WHERE NOT EXISTS (
                    SELECT 1 FROM entregas e
                    WHERE e.id_familia = f.id_familia 
                    AND e.id_periodo = (SELECT MAX(id_periodo) FROM periodos_entrega)
                )
                ORDER BY f.id_familia DESC
            `;
        }
        const [rows] = await pool.query(query);
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
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const { direccion, barrio, municipio, departamento, telefono_contacto, numero_integrantes, grupo_sisben, observaciones, cabeza_nombres, cabeza_apellidos, cabeza_documento } = req.body;

        // Validación de campos requeridos
        if (!direccion || !numero_integrantes || !cabeza_nombres || !cabeza_apellidos || !cabeza_documento) {
            return res.status(400).json({ mensaje: 'Dirección, integrantes y datos del jefe de hogar son requeridos' });
        }

        // Validación de cédula colombiana
        if (!/^[0-9]{6,11}$/.test(cabeza_documento.trim())) {
            return res.status(400).json({ mensaje: 'La cédula debe ser un número válido en Colombia (entre 6 y 11 dígitos)' });
        }

        if (direccion.trim().length < 5) {
            return res.status(400).json({ mensaje: 'La dirección debe tener al menos 5 caracteres' });
        }

        if (isNaN(numero_integrantes) || numero_integrantes < 1) {
            return res.status(400).json({ mensaje: 'El número de integrantes debe ser al menos 1' });
        }

        // Generar código de familia automático
        const codigo_familia = 'FAM-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);

        // Insertar Familia
        const [result] = await connection.query(
            'INSERT INTO familias (codigo_familia, direccion, barrio, municipio, departamento, telefono_contacto, numero_integrantes, grupo_sisben, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [codigo_familia, direccion.trim(), barrio || null, municipio || null, departamento || null, telefono_contacto || null, numero_integrantes, grupo_sisben || null, observaciones || null]
        );

        const familiaId = result.insertId;

        // Insertar Persona (Jefe de Hogar)
        await connection.query(
            'INSERT INTO personas (id_familia, tipo_documento, numero_documento, nombres, apellidos, es_jefe_hogar, telefono) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [familiaId, 'CC', cabeza_documento.trim(), cabeza_nombres.trim(), cabeza_apellidos.trim(), true, telefono_contacto || null]
        );

        await connection.commit();
        res.status(201).json({ mensaje: 'Familia registrada con éxito', id: familiaId, codigo_familia });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ mensaje: 'Ya existe una familia o persona con ese documento/código' });
        }
        res.status(500).json({ mensaje: 'Error al registrar familia' });
    } finally {
        if (connection) connection.release();
    }
};

const updateFamilia = async (req, res) => {
    try {
        const { id } = req.params;
        const { direccion, barrio, municipio, departamento, telefono_contacto, numero_integrantes, grupo_sisben, observaciones } = req.body;

        const [result] = await pool.query(
            'UPDATE familias SET direccion = ?, barrio = ?, municipio = ?, departamento = ?, telefono_contacto = ?, numero_integrantes = ?, grupo_sisben = ?, observaciones = ? WHERE id_familia = ?',
            [direccion, barrio, municipio, departamento, telefono_contacto, numero_integrantes, grupo_sisben, observaciones, id]
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
