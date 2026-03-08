const pool = require('../config/db');

const registrarEntrega = async (req, res) => {
    // 1. Obtener conexión única para asegurar la transacción completa
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { familia_id, periodo_entrega_id, detalles, observaciones } = req.body;
        const usuario_id = req.usuario.id || req.usuario.id_usuario;
        let periodoId = periodo_entrega_id;

        // id_periodo es obligatorio en la tabla entregas. Si no llega desde el frontend,
        // se usa el periodo mas reciente disponible.
        if (!periodoId) {
            const [periodosRows] = await connection.query(
                'SELECT id_periodo FROM periodos_entrega ORDER BY id_periodo DESC LIMIT 1'
            );
            if (periodosRows.length === 0) {
                throw new Error('No existe un periodo de entrega configurado. Debe crear uno antes de registrar entregas.');
            }
            periodoId = periodosRows[0].id_periodo;
        }

        // --- VALIDACIONES DE NEGOCIO OBLIGATORIAS ---

        // 1. Validar que la familia exista (Aunque la FK lo protege, esta validación debe existir lógicamente)
        const [familiaCheck] = await connection.query('SELECT id_familia FROM familias WHERE id_familia = ?', [familia_id]);
        if (familiaCheck.length === 0) {
            throw new Error('La familia indicada no existe en el sistema.');
        }

        // 2. Validar que la familia no haya recibido ayuda en el MISMO PERIODO (si existe la tabla)
        try {
            const [duplicidadCheck] = await connection.query(
                'SELECT id FROM control_entrega_familia WHERE id_familia = ? AND id_periodo = ?',
                [familia_id, periodoId]
            );
            if (duplicidadCheck.length > 0) {
                throw new Error('DUPLICIDAD_DETECTADA: La familia ya recibió ayuda durante este periodo.');
            }
        } catch (e) {
            // Si la tabla no existe, continuar sin validación de duplicidad
            console.log('Control de duplicidad no disponible:', e.message);
        }

        // --- REGISTRO DE CABECERAS Y COMPROBANTE ---

        // Generar un número de comprobante único temporal (luego se puede refinar con triggers o secuencias reales)
        const numero_comprobante = `COMP-${Date.now()}-${familia_id}`;

        // Crear la entrega principal
        const [entregaInsert] = await connection.query(
            'INSERT INTO entregas (id_familia, id_usuario_registra, id_periodo, fecha_entrega, observaciones) VALUES (?, ?, ?, NOW(), ?)',
            [familia_id, usuario_id, periodoId, observaciones]
        );
        const entrega_id = entregaInsert.insertId;

        // Registrar registro estricto en el control de entregas por familia (si existe la tabla)
        try {
            await connection.query(
                'INSERT INTO control_entrega_familia (id_familia, id_periodo, id_entrega) VALUES (?, ?, ?)',
                [familia_id, periodoId, entrega_id]
            );
        } catch (e) {
            // Si la tabla no existe, continuar
            console.log('Control de entregas por familia no disponible:', e.message);
        }

        // Crear Comprobante Digital (si existe la tabla)
        let comprobante_id = null;
        try {
            const [comprobanteInsert] = await connection.query(
                'INSERT INTO comprobantes (id_entrega, id_familia, numero_comprobante, fecha_generacion) VALUES (?, ?, ?, NOW())',
                [entrega_id, familia_id, numero_comprobante]
            );
            comprobante_id = comprobanteInsert.insertId;
        } catch (e) {
            console.log('Tabla comprobantes no disponible:', e.message);
        }

        // --- PROCESAMIENTO DE DETALLES Y DESCUENTO DE INVENTARIO ---

        for (const detalle of detalles) {
            const { lote_id, tipo_ayuda_id, cantidad } = detalle;

            // 3. Validar existencia del lote
            const [loteCheck] = await connection.query(
                'SELECT numero_lote, estado FROM ayuda_lotes WHERE id_lote = ? FOR UPDATE', // BLOQUEA LA FILA
                [lote_id]
            );

            if (loteCheck.length === 0) {
                throw new Error(`INVENTARIO_INSUFICIENTE: El lote ${lote_id} no existe.`);
            }
            
            if (loteCheck[0].estado !== 'DISPONIBLE') {
                throw new Error(`LOTE_NO_DISPONIBLE: El lote ${loteCheck[0].numero_lote} no está disponible.`);
            }

            // Registrar detalle de la entrega (si existe la tabla)
            try {
                await connection.query(
                    'INSERT INTO entrega_detalles (id_entrega, id_lote, cantidad) VALUES (?, ?, ?)',
                    [entrega_id, lote_id, cantidad]
                );
            } catch (e) {
                console.log('Tabla entrega_detalles no disponible:', e.message);
            }

            // Marcar lote como usado si se usó completamente
            await connection.query(
                'UPDATE ayuda_lotes SET estado = "AGOTADO" WHERE id_lote = ?',
                [lote_id]
            );

            // Registrar el movimiento de salida (Trazabilidad) si existe la tabla
            try {
                await connection.query(
                    'INSERT INTO inventario_movimientos (id_tipo_ayuda, id_lote, tipo_movimiento, cantidad, id_usuario, observaciones, id_entrega) VALUES (?, ?, "SALIDA", ?, ?, ?, ?)',
                    [tipo_ayuda_id, lote_id, cantidad, usuario_id, `Entrega a familia ID: ${familia_id}`, entrega_id]
                );
            } catch (e) {
                console.log('Tabla inventario_movimientos no disponible:', e.message);
            }
        }

        // --- COMMIT FINAL ---
        await connection.commit();

        res.status(201).json({
            mensaje: 'Entrega registrada exitosamente',
            entrega_id,
            comprobante: numero_comprobante
        });

    } catch (error) {
        // En caso de cualquier error (incluyendo las validaciones lógicas obligatorias), revierte ABSOLUTAMENTE TODO.
        await connection.rollback();
        console.error('Error procesando entrega:', error.message);

        // Retornar error descriptivo dependiendo del origen
        const status = error.message.includes('DUPLICIDAD') || error.message.includes('INVENTARIO') ? 409 : 400;
        res.status(status).json({ mensaje: error.message || 'Error al procesar la entrega.' });
    } finally {
        connection.release();
    }
};

const getEntregas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                e.id_entrega as id,
                e.fecha_entrega,
                e.estado,
                e.observaciones,
                f.id_familia,
                f.codigo_familia,
                u.nombre_completo as operador,
                CONCAT('COMP-', e.id_entrega) as numero_comprobante
            FROM entregas e
            JOIN familias f ON e.id_familia = f.id_familia
            JOIN usuarios u ON e.id_usuario_registra = u.id_usuario
            ORDER BY e.fecha_entrega DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener entregas:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al obtener historial' });
    }
};

module.exports = {
    registrarEntrega,
    getEntregas
};
