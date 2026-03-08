const pool = require('../config/db');
const { generateComprobantePDF } = require('../services/pdfService');

const descargarComprobante = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Obtener datos de la entrega y comprobante
        const [entregaRows] = await pool.query(`
            SELECT 
                e.id_entrega,
                e.id_familia,
                e.id_periodo,
                e.fecha_entrega,
                e.estado,
                e.observaciones,
                COALESCE(c.codigo_comprobante, CONCAT('COMP-', e.id_entrega)) AS numero_comprobante,
                f.codigo_familia,
                u.nombre_completo AS operador,
                CONCAT(COALESCE(p.nombres, ''), ' ', COALESCE(p.apellidos, '')) AS nombre_representante
            FROM entregas e
            LEFT JOIN comprobantes c ON c.id_entrega = e.id_entrega
            JOIN familias f ON e.id_familia = f.id_familia
            JOIN usuarios u ON e.id_usuario_registra = u.id_usuario
            LEFT JOIN personas p ON p.id_familia = f.id_familia AND p.es_jefe_hogar = 1
            WHERE e.id_entrega = ?
            ORDER BY c.id_comprobante DESC
            LIMIT 1
        `, [id]);

        if (entregaRows.length === 0) {
            return res.status(404).json({ mensaje: 'Comprobante no encontrado' });
        }

        const entregaDatos = entregaRows[0];

        // 2. Obtener detalles de la entrega
        const [detallesRows] = await pool.query(`
            SELECT 
                ed.cantidad,
                COALESCE(a.nombre, ta.nombre, 'Ayuda') AS nombre_tipo
            FROM entrega_detalles ed
            JOIN ayuda_lotes al ON ed.id_lote = al.id_lote
            LEFT JOIN ayudas a ON al.id_ayuda = a.id_ayuda
            LEFT JOIN tipos_ayuda ta ON a.id_tipo_ayuda = ta.id_tipo_ayuda
            WHERE ed.id_entrega = ?
        `, [id]);

        // 3. Generar y enviar PDF en memoria
        await generateComprobantePDF(id, entregaDatos, detallesRows, res);

    } catch (error) {
        console.error('Error al generar comprobante PDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ mensaje: 'Error al generar comprobante PDF' });
        }
    }
};

const getReporteAuditoria = async (req, res) => {
    try {
        // Ejemplo simple: Resumen de movimientos
        const [rows] = await pool.query(`
            SELECT 
                m.id_movimiento AS id,
                m.tipo_movimiento,
                m.cantidad,
                m.fecha_movimiento,
                m.motivo AS observaciones,
                COALESCE(a.nombre, t.nombre, 'Ayuda') AS nombre_tipo,
                u.nombre_completo AS responsable
            FROM inventario_movimientos m
            LEFT JOIN ayuda_lotes l ON m.id_lote = l.id_lote
            LEFT JOIN ayudas a ON l.id_ayuda = a.id_ayuda
            LEFT JOIN tipos_ayuda t ON a.id_tipo_ayuda = t.id_tipo_ayuda
            LEFT JOIN usuarios u ON m.id_usuario_registra = u.id_usuario
            ORDER BY m.fecha_movimiento DESC
            LIMIT 100
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener reporte de auditoría' });
    }
};

module.exports = {
    descargarComprobante,
    getReporteAuditoria
};
