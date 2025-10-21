const db = require('../db');
const bcrypt = require('bcrypt');

/**
 * Crea la tabla `users` si no existe.
 */
const initializeUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      nombre VARCHAR(255),
      role VARCHAR(50) NOT NULL DEFAULT 'estudiante',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  const client = await db.pool.connect();
  try {
    await client.query(query);
    console.log('Tabla users inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la tabla users:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Crea un nuevo usuario en la base de datos.
 * @param {Object} userData - Objeto con los datos del usuario.
 * @param {string} userData.username - Nombre de usuario.
 * @param {string} userData.password - Contraseña del usuario.
 * @param {string} userData.nombre - Nombre del usuario.
 * @param {string} userData.role - Rol del usuario.
 * @returns {Object} - Objeto con los datos del usuario creado.
 */
const createUser = async ({ username, password, nombre, role }) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // Verifica si el usuario ya existe
    const existingUser = await client.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('El nombre de usuario ya está en uso');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Inserta el nuevo usuario
    const result = await client.query(
      `INSERT INTO users (username, password_hash, nombre, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, username, nombre, role`,
      [username, hashedPassword, nombre, role]
    );
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Busca un usuario por nombre de usuario.
 * @param {string} username - Nombre de usuario.
 * @returns {Object|null} - Objeto con los datos del usuario o null si no existe.
 */
const findUserByUsername = async (username) => {
  const result = await db.query(
    'SELECT id, username, password_hash, nombre, role, created_at FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0] || null;
};

/**
 * Busca un usuario por ID.
 * @param {number} id - ID del usuario.
 * @returns {Object|null} - Objeto con los datos del usuario o null si no existe.
 */
const findUserById = async (id) => {
  const result = await db.query(
    'SELECT id, username, nombre, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

module.exports = {
  initializeUsersTable,
  createUser,
  findUserByUsername,
  findUserById,
};

