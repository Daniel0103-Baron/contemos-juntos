const pool = require('./config/db');

async function getRoles() {
    try {
        const [rows] = await pool.query("SELECT * FROM usuarios LIMIT 5;");
        console.log("Usuarios de prueba:", rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

getRoles();
