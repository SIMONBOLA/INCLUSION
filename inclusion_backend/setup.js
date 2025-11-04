const { pool } = require('./db');
const bcrypt = require('bcrypt');

async function setupInitialUsers () {
  const users = [
    {
      username: 'admin',
      password: 'admin123',
      nombre: 'Administrador',
      role: 'admin'
    },
    {
      username: 'profesor1',
      password: 'profesor123',
      nombre: 'Docente Ejemplo',
      role: 'profesor'
    }
  ];

  for (const user of users) {
    const password_hash = await bcrypt.hash(user.password, 10);
    await pool.query(
      'INSERT INTO users (username, password_hash, nombre, role) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING',
      [user.username, password_hash, user.nombre, user.role]
    );
  }
  console.log('Usuarios iniciales insertados correctamente');
}

if (require.main === module) {
  setupInitialUsers()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error al insertar usuarios iniciales:', err);
      process.exit(1);
    });
}

module.exports = setupInitialUsers;
