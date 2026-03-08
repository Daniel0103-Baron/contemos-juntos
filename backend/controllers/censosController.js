const pool = require('../config/db');

const getCensos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.*, f.codigo_familia, f.nombre_representante, 
                   u.nombre as operador_nombre 
            FROM censos c
            JOIN familias f ON c.familia_id = f.id
            JOIN usuarios u ON c.usuario_id = u.id
            ORDER BY c.fecha_censo DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener censos' });
    }
};

const createCenso = async (req, res) => {
    try {
        const { familia_id, nivel_vulnerabilidad, observaciones } = req.body;
        // El usuario logueado registra el censo
        const usuario_id = req.usuario.id || req.usuario.id_usuario;

        // Finalizar censo anterior si existiera (asumiendo lógica de "vigente")
        await pool.query('UPDATE censos SET vigente = FALSE WHERE familia_id = ?', [familia_id]);

        const [result] = await pool.query(
            'INSERT INTO censos (familia_id, usuario_id, nivel_vulnerabilidad, observaciones, vigente) VALUES (?, ?, ?, ?, TRUE)',
            [familia_id, usuario_id, nivel_vulnerabilidad, observaciones]
        );

        res.status(201).json({ mensaje: 'Censo registrado con éxito', id: result.insertId });
    } catch (error) {
        console.error('Error creando censo:', error);
        res.status(500).json({ mensaje: 'Error al registrar censo' });
    }
};

module.exports = {
    getCensos,
    createCenso
};
