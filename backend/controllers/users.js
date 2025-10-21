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

// Añadir este nuevo endpoint para obtener estudiantes
usersRouter.get('/students', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, nombre, role FROM users WHERE role = $1',
      ['estudiante']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching students:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener las notas de un estudiante específico
usersRouter.get('/students/:id/grades', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM grades WHERE student_id = $1',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching grades:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para actualizar las notas de un estudiante
usersRouter.post('/students/:id/grades', async (req, res) => {
  const { subject, previousGrade, currentGrade } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO grades (student_id, subject, previous_grade, current_grade) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.id, subject, previousGrade, currentGrade]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding grade:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = usersRouter;