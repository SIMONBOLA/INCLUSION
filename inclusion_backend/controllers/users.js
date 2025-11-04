const express = require('express');
const bcrypt = require('bcrypt');
const { createUser, findUserByUsername, findUserById } = require('../models/user');
const { User, Estudiante, sequelize } = require('../models');
const db = require('../db');
const logger = require('../utils/logger');
const usersRouter = express.Router();

/**
 * @middleware
 * Valida el rol del usuario
 */
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ 
        ok: false,
        error: 'No autorizado - rol no encontrado' 
      });
    }

    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({ 
        ok: false,
        error: 'No tiene permisos para esta acción' 
      });
    }

    next();
  };
};

usersRouter.get('/', verificarRol(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Estudiante,
        as: 'estudiante',
        attributes: ['grupo']
      }],
      attributes: ['id', 'username', 'nombre', 'role', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
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
    const { User } = require('../models');
    const estudiantes = await User.findAll({
      where: { role: 'estudiante' },
      attributes: ['id', 'username', 'nombre', 'role'],
      order: [['nombre', 'ASC']]
    });
    res.json(estudiantes);
  } catch (error) {
    console.error('Error al obtener estudiantes:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener un estudiante específico
usersRouter.get('/estudiantes/:id', async (req, res) => {
  try {
    const { User } = require('../models');
    const estudiante = await User.findOne({
      where: { 
        id: req.params.id,
        role: 'estudiante'
      },
      attributes: ['id', 'username', 'nombre', 'role']
    });
    
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    
    res.json(estudiante);
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
    // Crear registro en estudiantes si no existe
    const estudianteExiste = await db.query(
      'SELECT * FROM estudiantes WHERE user_id = $1',
      [req.params.id]
    );
    if (estudianteExiste.rows.length === 0) {
      await db.query(
        'INSERT INTO estudiantes (user_id, grupo, promedio) VALUES ($1, $2, $3)',
        [req.params.id, '3A', 8.0, 90]
      );
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

// Endpoint para eliminar un usuario (solo admin)
usersRouter.delete('/:id', verificarRol(['admin']), async (req, res) => {

  let transaction;
  
  try {
    transaction = await sequelize.transaction();
    // Primero verificar si el usuario existe
    const user = await User.findByPk(req.params.id, { transaction });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si es estudiante, eliminar primero los registros relacionados
    if (user.role === 'estudiante') {
      await Estudiante.destroy({
        where: { user_id: req.params.id },
        transaction
      });
    }

    // Finalmente eliminar el usuario
    await user.destroy({ transaction });

    await transaction.commit();
    res.status(204).end();
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error('Error al eliminar usuario:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = usersRouter;