const mysql = require('mysql2/promise');

async function migrate() {
    // Connect to Local
    const localPool = mysql.createPool({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'malandra',
        database: 'contemos_juntos',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // Connect to Aiven
    const aivenPool = mysql.createPool({
        host: 'mysql-3911881b-celulardaniel32-24fe.l.aivencloud.com',
        port: 26450,
        user: 'avnadmin',
        password: 'AVNS_C7ANYUf4NHyw0nzWOze',
        database: 'defaultdb',
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log("Conectando a local...");
        const [tables] = await localPool.query("SHOW TABLES");
        
        await aivenPool.query("SET FOREIGN_KEY_CHECKS=0");

        for (const row of tables) {
            const tableName = Object.values(row)[0];
            console.log(`Extrayendo esquema de ${tableName}...`);
            const [createTableResult] = await localPool.query(`SHOW CREATE TABLE \`${tableName}\``);
            const createStatement = createTableResult[0]['Create Table'];
            
            console.log(`Creando tabla ${tableName} en Aiven...`);
            await aivenPool.query(createStatement);

            // Fetch data
            console.log(`Extrayendo datos de ${tableName}...`);
            const [data] = await localPool.query(`SELECT * FROM \`${tableName}\``);
            
            if (data.length > 0) {
                console.log(`Insertando ${data.length} filas en ${tableName}...`);
                const keys = Object.keys(data[0]);
                const values = data.map(d => keys.map(k => d[k]));
                
                // Construct placeholders
                const placeholders = keys.map(() => '?').join(', ');
                
                await aivenPool.query(`INSERT INTO \`${tableName}\` (${keys.map(k => `\`${k}\``).join(', ')}) VALUES ?`, [values]);
            }
        }
        
        await aivenPool.query("SET FOREIGN_KEY_CHECKS=1");
        console.log("Migración completada exitosamente.");
    } catch (error) {
        console.error("Error durante la migración:", error);
    } finally {
        await localPool.end();
        await aivenPool.end();
    }
}

migrate();
