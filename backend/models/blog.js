const db = require('../db');

/**
 * Crea la tabla `blogs` si no existe.
 */
const initializeBlogsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS blogs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db.query(query);
};

/**
 * Crea un nuevo blog en la base de datos.
 * @param {Object} blog - Objeto con los datos del blog.
 * @param {string} blog.title - Título del blog.
 * @param {string} blog.content - Contenido del blog.
 * @param {number} blog.userId - ID del usuario que creó el blog.
 * @returns {Object} - Objeto con los datos del blog creado.
 */
const createBlog = async ({ title, content, userId }) => {
  const result = await db.query(
    'INSERT INTO blogs (title, content, user_id) VALUES ($1, $2, $3) RETURNING id, title, content, user_id, created_at',
    [title, content, userId]
  );
  return result.rows[0];
};

/**
 * Obtiene todos los blogs junto con el nombre de usuario del autor.
 * @returns {Array} - Lista de blogs con los datos del autor.
 */
const findAllBlogs = async () => {
  const result = await db.query(`
    SELECT b.id, b.title, b.content, b.created_at, u.username
    FROM blogs b
    JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC
  `);
  return result.rows;
};

/**
 * Busca un blog por ID.
 * @param {number} id - ID del blog.
 * @returns {Object|null} - Objeto con los datos del blog o null si no existe.
 */
const findBlogById = async (id) => {
  const result = await db.query('SELECT * FROM blogs WHERE id = $1', [id]);
  return result.rows[0] || null;
};

module.exports = {
  initializeBlogsTable,
  createBlog,
  findAllBlogs,
  findBlogById,
};
