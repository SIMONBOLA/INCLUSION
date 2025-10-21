const db = require('./db');

async function testDatabase() {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('Conexión exitosa a la base de datos');
    console.log('Timestamp:', result.rows[0].now);
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
  }
}

testDatabase();