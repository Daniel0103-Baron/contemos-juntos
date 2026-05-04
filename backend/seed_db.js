require('dotenv').config();
const pool = require('./config/db');

const nombres = ['Juan', 'Maria', 'Carlos', 'Ana', 'Luis', 'Pedro', 'Laura', 'Diana', 'Jorge', 'Sofia'];
const apellidos = ['Gomez', 'Perez', 'Rodriguez', 'Martinez', 'Garcia', 'Lopez', 'Hernandez', 'Gonzalez', 'Diaz', 'Sanchez'];
const barrios = ['Villa Petro', 'San Miguel', 'Centro', 'El Bosque', 'Las Flores', 'Kennedy', 'Laureles', 'El Poblado'];
const sisbenGroups = ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C12', 'D1', 'D10'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDocument() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

async function seed() {
    let connection;
    try {
        console.log('Iniciando carga masiva de datos...');
        connection = await pool.getConnection();

        // 1. Insertar 400 Familias y Personas
        console.log('Generando 400 familias...');
        for (let i = 0; i < 400; i++) {
            const codigo = 'FAM-' + Date.now().toString().slice(-4) + Math.floor(Math.random() * 10000);
            const direccion = `Calle ${Math.floor(Math.random() * 100)} # ${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 100)}`;
            const integrantes = Math.floor(Math.random() * 6) + 1;
            const sisben = getRandomItem(sisbenGroups);
            const barrio = getRandomItem(barrios);

            const [famResult] = await connection.query(
                'INSERT INTO familias (codigo_familia, direccion, barrio, numero_integrantes, grupo_sisben) VALUES (?, ?, ?, ?, ?)',
                [codigo, direccion, barrio, integrantes, sisben]
            );

            const familiaId = famResult.insertId;

            // Persona
            const doc = getRandomDocument();
            const nombre = getRandomItem(nombres);
            const apellido = getRandomItem(apellidos);

            await connection.query(
                'INSERT INTO personas (id_familia, tipo_documento, numero_documento, nombres, apellidos, es_jefe_hogar) VALUES (?, ?, ?, ?, ?, ?)',
                [familiaId, 'CC', doc, nombre, apellido, true]
            );

            if (i % 50 === 0) console.log(`${i} familias creadas...`);
        }
        console.log('400 familias creadas con éxito.');

        // 2. Insertar Kits (Lotes)
        console.log('Generando inventario de kits...');
        const [tiposAyuda] = await connection.query('SELECT id_tipo_ayuda FROM tipos_ayuda WHERE estado = 1');
        
        for (const tipo of tiposAyuda) {
            // Check if there is an ayuda mapping for this tipo
            const [ayudaRows] = await connection.query('SELECT id_ayuda FROM ayudas WHERE id_tipo_ayuda = ? LIMIT 1', [tipo.id_tipo_ayuda]);
            if (ayudaRows.length === 0) continue;
            
            const idAyuda = ayudaRows[0].id_ayuda;

            // Insert 10 lots of 50 items for each type
            for (let j = 0; j < 10; j++) {
                const loteNum = 'LOT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
                const cantidad = 50 + Math.floor(Math.random() * 50); // 50 to 100

                const [loteResult] = await connection.query(
                    'INSERT INTO ayuda_lotes (id_ayuda, numero_lote, cantidad_inicial, cantidad_disponible, estado, fecha_ingreso) VALUES (?, ?, ?, ?, ?, CURDATE())',
                    [idAyuda, loteNum, cantidad, cantidad, 'DISPONIBLE']
                );
            }
        }
        console.log('Kits generados con éxito.');

        console.log('¡Carga de datos completada exitosamente!');
    } catch (error) {
        console.error('Error durante la carga masiva:', error);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

seed();
