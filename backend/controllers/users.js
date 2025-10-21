const express = require('express');
const bcrypt = require('bcrypt');
const { createUser, findUserByUsername, findUserById } = require('../models/user');
const db = require('../db');
const usersRouter = express.Router();

usersRouter.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, nombre, role, created_at FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

usersRouter.post('/', async (req, res) => {
  const { username, nombre, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'username, password, and role are required' });
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await createUser({ username, passwordHash, nombre, role });
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Endpoint para obtener la lista de estudiantes
usersRouter.get('/estudiantes', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, nombre as name, email, role FROM users WHERE role = $1 ORDER BY nombre',
      ['estudiante']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener estudiantes:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener un estudiante específico
usersRouter.get('/estudiantes/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, nombre as name, email, role FROM users WHERE id = $1 AND role = $2',
      [req.params.id, 'estudiante']
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener estudiante:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener las notas de un estudiante específico
usersRouter.get('/estudiantes/:id/notas', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM grades WHERE student_id = $1',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener notas:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para actualizar los datos de un estudiante
usersRouter.put('/estudiantes/:id', async (req, res) => {
  const { nombre, email } = req.body;
  try {
    const result = await db.query(
      'UPDATE users SET nombre = $1, email = $2 WHERE id = $3 AND role = $4 RETURNING id, username, nombre as name, email, role',
      [nombre, email, req.params.id, 'estudiante']
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    
    console.log('Estudiante actualizado:', result.rows[0]); // Para depuración
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar estudiante:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para actualizar las notas de un estudiante
usersRouter.post('/estudiantes/:id/notas', async (req, res) => {
  const { subject, previousGrade, currentGrade } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO grades (student_id, subject, previous_grade, current_grade) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.id, subject, previousGrade, currentGrade]
    );
    console.log('Nota agregada:', result.rows[0]); // Para depuración
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar nota:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = usersRouter;