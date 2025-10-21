const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

router.post('/', async (req, res) => {
  console.log('Datos recibidos en el backend:', req.body);
  const { username, password, nombre, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Se requieren nombre de usuario y contraseña' 
    });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Verificar si el usuario ya existe
    const userExists = await client.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (userExists.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'El nombre de usuario ya está en uso' 
      });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar el nuevo usuario
    const result = await client.query(
      'INSERT INTO users (username, password_hash, nombre, role) VALUES ($1, $2, $3, $4) RETURNING id, username, nombre, role',
      [username, passwordHash, nombre, role]
    );

    await client.query('COMMIT');

    console.log('Usuario creado:', result.rows[0]);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en registro:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario',
      details: error.message 
    });
  } finally {
    client.release();
  }
});

module.exports = router;