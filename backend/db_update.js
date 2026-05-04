const pool = require('./config/db');

async function migrate() {
    try {
        console.log("Adding columns to ayuda_lotes...");
        await pool.query('ALTER TABLE ayuda_lotes ADD COLUMN cantidad_inicial INT NOT NULL DEFAULT 1 AFTER numero_lote;');
        await pool.query('ALTER TABLE ayuda_lotes ADD COLUMN cantidad_disponible INT NOT NULL DEFAULT 1 AFTER cantidad_inicial;');
        console.log("Success!");
    } catch (e) {
        console.error("Migration failed or already applied:", e.message);
    } finally {
        process.exit();
    }
}
migrate();
