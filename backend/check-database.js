const pool = require('./config/db');

async function checkDatabase() {
    try {
        console.log('=== REVISIÓN COMPLETA DE LA BASE DE DATOS ===\n');

        // 1. Ver todas las tablas
        const [tables] = await pool.query('SHOW TABLES;');
        console.log('📋 Tablas en la BD:');
        tables.forEach(t => console.log('  -', Object.values(t)[0]));
        console.log('');

        // 2. Estructura de tablas principales
        const tablasImportantes = ['usuarios', 'familias', 'personas', 'tipos_ayuda', 'stock_ayudas', 
            'ayuda_lotes', 'entregas', 'entregas_detalle', 'censos'];

        for (const tabla of tablasImportantes) {
            try {
                const [structure] = await pool.query(`DESCRIBE ${tabla};`);
                console.log(`\n📊 Estructura de tabla: ${tabla}`);
                console.table(structure);
            } catch (e) {
                console.log(`\n⚠️ Tabla ${tabla} no existe`);
            }
        }

        // 3. Contar registros
        console.log('\n📈 Cantidad de registros:');
        for (const tabla of tablasImportantes) {
            try {
                const [count] = await pool.query(`SELECT COUNT(*) as total FROM ${tabla};`);
                console.log(`  ${tabla}: ${count[0].total} registros`);
            } catch (e) {
                // Tabla no existe
            }
        }

        await pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkDatabase();
