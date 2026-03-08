const pool = require('../config/db');

const getInventarioActual = async (req, res) => {
    try {
        // Cambiar query para usar estructura real de la BD
        const [rows] = await pool.query(`
            SELECT 
                ta.id_tipo_ayuda,
                ta.nombre,
                ta.nombre as nombre_tipo,
                ta.descripcion,
                COALESCE(SUM(CASE WHEN al.estado = 'DISPONIBLE' THEN 1 ELSE 0 END), 0) as lotes_disponibles,
                COALESCE(SUM(CASE WHEN al.estado = 'DISPONIBLE' THEN 1 ELSE 0 END), 0) as cantidad_disponible
            FROM tipos_ayuda ta
            LEFT JOIN ayudas a ON ta.id_tipo_ayuda = a.id_tipo_ayuda
            LEFT JOIN ayuda_lotes al ON a.id_ayuda = al.id_ayuda
            WHERE ta.estado = 1
            GROUP BY ta.id_tipo_ayuda, ta.nombre, ta.descripcion
            ORDER BY ta.nombre ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener inventario' });
    }
};

const getLotesStock = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                al.id_lote,
                al.numero_lote,
                al.fecha_vencimiento,
                al.fecha_ingreso,
                al.estado,
                a.id_ayuda,
                ta.nombre as tipo_ayuda
            FROM ayuda_lotes al
            JOIN ayudas a ON al.id_ayuda = a.id_ayuda
            JOIN tipos_ayuda ta ON a.id_tipo_ayuda = ta.id_tipo_ayuda
            WHERE al.estado = 'DISPONIBLE'
            ORDER BY al.fecha_vencimiento ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener lotes' });
    }
};

const registrarIngreso = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id_tipo_ayuda, id_ayuda, numero_lote, fecha_vencimiento, fecha_ingreso, observaciones } = req.body;
        const usuario_id = req.usuario.id || req.usuario.id_usuario;
        let ayudaId = id_ayuda;

        // Permitir enviar solo id_tipo_ayuda desde frontend.
        if (!ayudaId && id_tipo_ayuda) {
            const [ayudaRows] = await connection.query(
                'SELECT id_ayuda FROM ayudas WHERE id_tipo_ayuda = ? LIMIT 1',
                [id_tipo_ayuda]
            );
            if (ayudaRows.length > 0) {
                ayudaId = ayudaRows[0].id_ayuda;
            }
        }

        // Validación de campos requeridos
        if (!ayudaId || !numero_lote) {
            await connection.rollback();
            return res.status(400).json({ mensaje: 'Los campos: id_ayuda (o id_tipo_ayuda) y numero_lote son requeridos' });
        }

        // Validación de lote
        if (numero_lote.trim().length === 0) {
            await connection.rollback();
            return res.status(400).json({ mensaje: 'El número de lote no puede estar vacío' });
        }

        if (numero_lote.trim().length < 3) {
            await connection.rollback();
            return res.status(400).json({ mensaje: 'El número de lote debe tener al menos 3 caracteres' });
        }

        // Validación de fecha vencimiento si se proporciona
        if (fecha_vencimiento) {
            const fechaVencimiento = new Date(fecha_vencimiento);
            const hoy = new Date();
            if (fechaVencimiento < hoy) {
                await connection.rollback();
                return res.status(400).json({ mensaje: 'La fecha de vencimiento no puede ser en el pasado' });
            }
        }

        // 1. Crear el Lote
        const [loteInsert] = await connection.query(
            'INSERT INTO ayuda_lotes (id_ayuda, numero_lote, fecha_vencimiento, fecha_ingreso, estado) VALUES (?, ?, ?, ?, ?)',
            [ayudaId, numero_lote.trim(), fecha_vencimiento || null, fecha_ingreso || new Date().toISOString().split('T')[0], 'DISPONIBLE']
        );
        const lote_id = loteInsert.insertId;

        // 2. Registrar el Ingreso (si tienes tabla ingresos_ayuda)
        try {
            await connection.query(
                'INSERT INTO ingresos_ayuda (lote_id, usuario_id, observaciones) VALUES (?, ?, ?)',
                [lote_id, usuario_id, observaciones || null]
            );
        } catch (e) {
            // Si no existe la tabla, continuar
            console.log('Tabla ingresos_ayuda no existe o error:', e.message);
        }

        await connection.commit();
        res.status(201).json({ mensaje: 'Ingreso registrado correctamente', lote_id });
    } catch (error) {
        await connection.rollback();
        console.error('Error registrando ingreso:', error);
        res.status(500).json({ mensaje: 'Error al registrar ingreso de inventario', error: error.message });
    } finally {
        connection.release();
    }
};

module.exports = {
    getInventarioActual,
    getLotesStock,
    registrarIngreso
};
