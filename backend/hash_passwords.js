const bcrypt = require('bcrypt');
const pool = require('./config/db');

async function hashPasswords() {
    try {
        const [users] = await pool.query('SELECT id_usuario, correo, password_hash FROM usuarios');
        console.log('Usuarios a procesar:', users.length);

        for (const user of users) {
            const pwd = user.password_hash;
            // Si ya es un hash bcrypt (empieza con $2b$) no lo volvemos a hashear
            if (pwd && pwd.startsWith('$2')) {
                console.log(`[SKIP] ${user.correo} - ya tiene hash bcrypt`);
                continue;
            }
            // Hashear la contraseña actual (texto plano)
            const hashed = await bcrypt.hash(pwd, 12);
            await pool.query('UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?', [hashed, user.id_usuario]);
            console.log(`[OK] ${user.correo} - contraseña hasheada`);
        }

        console.log('\nListo! Todas las contraseñas están ahora protegidas con bcrypt.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        pool.end();
        process.exit(0);
    }
}

hashPasswords();
