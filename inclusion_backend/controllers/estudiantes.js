const express = require('express');
const estudiantesRouter = express.Router();
const logger = require('../utils/logger');
const { User, Estudiante, Nota, Materia } = require('../models');

// GET all estudiantes
estudiantesRouter.get('/', async (req, res) => {
  try {
    const estudiantes = await Estudiante.findAll({
      include: [
        {
          model: Nota,
          as: 'notas',
          include: [{
            model: Materia,
            as: 'materia'
          }]
        },
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'username']
        }
      ]
    });
    res.json(estudiantes);
  } catch (error) {
    logger.error('Error al obtener estudiantes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET estudiante by ID
estudiantesRouter.get('/:id', async (req, res) => {
  try {
    const estudiante = await Estudiante.findByPk(req.params.id, {
      include: [{
        model: Nota,
        include: [{
          model: Materia
        }]
      }]
    });

    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    res.json(estudiante);
  } catch (error) {
    logger.error('Error al obtener estudiante:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET estudiante by user_id
estudiantesRouter.get('/usuario/:userId', async (req, res) => {
  try {
    const estudiante = await Estudiante.findOne({
      where: { user_id: req.params.userId },
      include: [{
        model: Nota,
        include: [{ model: Materia }]
      }]
    });
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado para ese usuario' });
    }
    res.json(estudiante);
  } catch (error) {
    logger.error('Error al obtener estudiante por user_id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT update notas
estudiantesRouter.put('/:id/notas', async (req, res) => {
  try {
    const { materiaId, calificacion } = req.body;
    if (!materiaId || calificacion === undefined) {
      return res.status(400).json({ error: 'materiaId y calificacion son requeridos' });
    }

    const notas = await Nota.findAll({
      where: {
        estudiante_id: req.params.id,
        materia_id: materiaId
      },
      order: [['fecha', 'DESC']]
    });

    const nuevaNota = await Nota.create({
      estudiante_id: req.params.id,
      materia_id: materiaId,
      valor: calificacion,
      fecha: new Date(),
      periodo: 'actual'
    });

    if (notas.length >= 2) {
      await notas[notas.length - 1].destroy();
    }

    res.json(nuevaNota);
  } catch (error) {
    logger.error('Error al actualizar nota:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST create estudiante
estudiantesRouter.post('/', async (req, res) => {
  try {
    const nuevoEstudiante = await Estudiante.create(req.body);
    res.status(201).json(nuevoEstudiante);
  } catch (error) {
    logger.error('Error al crear estudiante:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT update estudiante
estudiantesRouter.put('/:id', async (req, res) => {
  try {
    const estudiante = await Estudiante.findByPk(req.params.id);
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    await estudiante.update(req.body);
    res.json(estudiante);
  } catch (error) {
    logger.error('Error al actualizar estudiante:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE estudiante
estudiantesRouter.delete('/:id', async (req, res) => {
  try {
    const estudiante = await Estudiante.findByPk(req.params.id);
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    await estudiante.destroy();
    res.status(204).end();
  } catch (error) {
    logger.error('Error al eliminar estudiante:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = estudiantesRouter;