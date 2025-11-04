const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // Añadiendo opciones adicionales para mejor manejo de errores
  max: 20, // máximo número de clientes en el pool
  idleTimeoutMillis: 30000, // tiempo máximo que un cliente puede estar inactivo
  connectionTimeoutMillis: 2000, // tiempo máximo para establecer una conexión
});

// Manejador de errores del pool
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL', err);
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Conexión exitosa a la base de datos PostgreSQL');
    client.release();
    return true;
  } catch (err) {
    console.error('Error al conectar a PostgreSQL:', err.message);
    return false;
  }
};

// Ejecutar prueba de conexión inmediatamente
testConnection();

module.exports = {
  pool,
  testConnection
};