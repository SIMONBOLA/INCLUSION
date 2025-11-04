const express = require('express');
const materiasRouter = express.Router();
const { Materia } = require('../models');
const logger = require('../utils/logger');

// GET todas las materias
materiasRouter.get('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const materias = await Materia.findAll({
      order: [['nombre', 'ASC']]
    });
    
    return res.status(200).json(materias);
  } catch (error) {
    logger.error('Error al obtener materias:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST crear nueva materia
materiasRouter.post('/', async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la materia es requerido' });
    }

    // Verificar si la materia ya existe
    const materiaExistente = await Materia.findOne({ where: { nombre } });
    if (materiaExistente) {
      return res.status(400).json({ error: 'La materia ya existe' });
    }

    const materia = await Materia.create({ 
      nombre,
      created_at: new Date()
    });
    res.status(201).json(materia);
  } catch (error) {
    logger.error('Error al crear materia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = materiasRouter;