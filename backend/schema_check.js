const pool = require('./config/db');

async function checkSchema() {
    try {
        const tables = [
            'tipos_ayuda', 'ayudas', 'ayuda_lotes', 
            'entregas', 'entrega_detalles', 
            'inventario_movimientos', 'ingresos_ayuda'
        ];
        
        const schema = {};
        for (const tbl of tables) {
            try {
                const [cols] = await pool.query(`DESCRIBE ${tbl}`);
                schema[tbl] = cols.map(c => `${c.Field} (${c.Type})`);
            } catch (e) {
                schema[tbl] = "Table does not exist: " + e.message;
            }
        }
        console.log(JSON.stringify(schema, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
checkSchema();
