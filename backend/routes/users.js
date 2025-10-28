const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const logger = require('../utils/logger');
const authMiddleware = require('../middlewares/auth');

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

/**
 * @route GET /api/usuarios
 * @desc Obtiene todos los usuarios (solo para administradores)
 */
router.get('/', authMiddleware, verificarRol(['admin']), async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, username, nombre, role, created_at FROM users'
    );
    res.json(resultado.rows);
  } catch (error) {
    logger.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      error: 'Error al obtener usuarios',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/usuarios/estudiantes/:id/notas
 * @desc Obtiene las notas de un estudiante específico
 */
router.get('/estudiantes/:id/notas', authMiddleware, verificarRol(['profesor', 'admin']), async (req, res) => {
  try {
    const idEstudiante = req.params.id;
    const resultado = await pool.query(
      'SELECT * FROM notas WHERE id_estudiante = $1',
      [idEstudiante]
    );
    res.json(resultado.rows);
  } catch (error) {
    logger.error('Error al obtener notas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route POST /api/usuarios/estudiantes/:id/notas
 * @desc Agrega una nueva nota a un estudiante
 */
router.post('/estudiantes/:id/notas', authMiddleware, verificarRol(['profesor', 'admin']), async (req, res) => {
  try {
    const idEstudiante = req.params.id;
    const { materia, notaAnterior, notaActual } = req.body;

    if (!materia || notaAnterior === undefined || notaActual === undefined) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const resultado = await pool.query(
      `INSERT INTO notas (id_estudiante, materia, nota_anterior, nota_actual) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [idEstudiante, materia, notaAnterior, notaActual]
    );
    
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    logger.error('Error al agregar nota:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route PUT /api/usuarios/estudiantes/:idEstudiante/notas/:idNota
 * @desc Actualiza una nota existente
 */
router.put('/estudiantes/:idEstudiante/notas/:idNota', authMiddleware, verificarRol(['profesor', 'admin']), async (req, res) => {
  try {
    const { idEstudiante, idNota } = req.params;
    const { materia, notaAnterior, notaActual } = req.body;

    const resultado = await pool.query(
      `UPDATE notas 
       SET materia = $1, nota_anterior = $2, nota_actual = $3 
       WHERE id = $4 AND id_estudiante = $5 
       RETURNING *`,
      [materia, notaAnterior, notaActual, idNota, idEstudiante]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    logger.error('Error al actualizar nota:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route DELETE /api/usuarios/estudiantes/:idEstudiante/notas/:idNota
 * @desc Elimina una nota
 */
router.delete('/estudiantes/:idEstudiante/notas/:idNota', authMiddleware, verificarRol(['profesor', 'admin']), async (req, res) => {
  try {
    const { idEstudiante, idNota } = req.params;

    const resultado = await pool.query(
      'DELETE FROM notas WHERE id = $1 AND id_estudiante = $2 RETURNING *',
      [idNota, idEstudiante]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    res.status(204).end();
  } catch (error) {
    logger.error('Error al eliminar nota:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;