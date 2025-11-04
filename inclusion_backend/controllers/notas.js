const express = require('express');
const notasRouter = express.Router();
const { Nota, Estudiante, User, Materia } = require('../models');
const calcularYActualizarPromedio = require('../utils/promedioCalculator');
// GET /api/notas/usuario/:userId
notasRouter.get('/usuario/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Buscar el usuario y verificar que sea estudiante
    const user = await User.findByPk(userId);
    if (!user || user.role !== 'estudiante') {
      return res.status(404).json({ error: 'Usuario no es estudiante o no existe' });
    }

    // Buscar el estudiante asociado a ese user_id
    const estudiante = await Estudiante.findOne({ where: { user_id: userId } });
    if (!estudiante) {
      return res.status(404).json({ error: 'No existe estudiante asociado a este usuario' });
    }

    // Permitir solo si el usuario autenticado es el mismo estudiante o un profesor/admin
    if (req.user.role === 'estudiante' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'No tienes permiso para ver estas notas' });
    }

    // Obtener las notas
    const notas = await Nota.findAll({
      where: { estudiante_id: estudiante.id },
      include: [ { model: Materia, as: 'materia' } ],
      order: [['fecha', 'DESC']]
    });

    return res.status(200).json({
      notas,
      promedio: estudiante.promedio || 0
    });
  } catch (error) {
    console.error('Error al obtener notas por user_id:', error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/notas
notasRouter.post('/', async (req, res) => {
  try {
    const { estudiante_id, materia_id, valor, fecha, periodo, observaciones, profesor_id } = req.body;
    if (!estudiante_id || !materia_id || !valor || !fecha || !periodo) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Validar que el valor sea un número válido
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico)) {
      return res.status(400).json({ error: 'El valor de la nota debe ser un número válido' });
    }

    const nota = await Nota.create({
      estudiante_id,
      materia_id,
      valor: valorNumerico,
      fecha,
      periodo,
      observaciones,
      profesor_id,
      created_by: req.user?.id || null
    });
    
    // Calcular y actualizar el promedio
    const nuevoPromedio = await calcularYActualizarPromedio(estudiante_id);
    
    // Devolver la nota y el promedio actualizado
    res.status(201).json({
      nota,
      promedio: nuevoPromedio
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/notas/:estudianteId
notasRouter.get('/:estudianteId', async (req, res) => {
  try {
    const { estudianteId } = req.params;
    
    // Verificar si el usuario tiene permiso para ver estas notas
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    // Obtener el estudiante
    const estudiante = await Estudiante.findByPk(estudianteId);
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // Verificar permisos
    console.log('Usuario autenticado:', req.user);
    console.log('Estudiante encontrado:', estudiante);
    
    // Si es estudiante, solo puede ver sus propias notas
    if (req.user.role === 'estudiante') {
      const estudianteUser = await Estudiante.findOne({ 
        where: { user_id: req.user.id }
      });
      
      if (!estudianteUser || estudianteUser.id !== parseInt(estudianteId)) {
        return res.status(403).json({ error: 'No tienes permiso para ver estas notas' });
      }
    }
    // Los profesores y admins pueden ver todas las notas
    
    // Obtener las notas con sus materias
    const notas = await Nota.findAll({
      where: { estudiante_id: estudianteId },
      include: [
        { model: Materia, as: 'materia' },
      ],
      order: [['fecha', 'DESC']]
    });
    
    // Devolver las notas y el promedio actual del estudiante
    return res.status(200).json({
      notas,
      promedio: estudiante.promedio || 0
    });
  } catch (error) {
    console.error('Error al obtener notas:', error);
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/notas/:id
notasRouter.put('/:id', async (req, res) => {
  try {
    // Verificar autenticación
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const { id } = req.params;
    const { valor, observaciones, fecha, periodo } = req.body;

    // Obtener la nota existente con información del estudiante
    const nota = await Nota.findOne({
      where: { id },
      include: [
        { model: Estudiante, as: 'estudiante' }
      ]
    });

    if (!nota) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    // Verificar permisos - solo profesores pueden modificar notas
    if (req.user.role !== 'profesor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para modificar notas' });
    }

    // Validar que el valor sea un número válido si se proporciona
    if (valor !== undefined) {
      const valorNumerico = parseFloat(valor);
      if (isNaN(valorNumerico) || valorNumerico < 0 || valorNumerico > 10) {
        return res.status(400).json({ error: 'El valor de la nota debe ser un número válido entre 0 y 10' });
      }
    }

    // Actualizar la nota
    await nota.update({
      valor: valor !== undefined ? parseFloat(valor) : nota.valor,
      observaciones: observaciones !== undefined ? observaciones : nota.observaciones,
      profesor_id: req.user.id // registrar quién hizo la modificación
    });

    // Recalcular y actualizar el promedio
    const nuevoPromedio = await calcularYActualizarPromedio(nota.estudiante_id);

    res.json({
      nota,
      promedio: nuevoPromedio
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/notas/promedios/:estudianteId
notasRouter.get('/promedios/:estudianteId', async (req, res) => {
  try {
    const { estudianteId } = req.params;
    const notas = await Nota.findAll({
      where: { estudiante_id: estudianteId },
      attributes: ['materia_id', [Nota.sequelize.fn('AVG', Nota.sequelize.col('valor')), 'promedio']],
      group: ['materia_id'],
      include: [{ model: Materia, as: 'materia' }]
    });
    res.json(notas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/notas/:id
notasRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { valor, observaciones } = req.body;

    // Validar que el valor sea un número válido si se proporciona
    if (valor !== undefined) {
      const valorNumerico = parseFloat(valor);
      if (isNaN(valorNumerico) || valorNumerico < 0 || valorNumerico > 5) {
        return res.status(400).json({ error: 'El valor de la nota debe ser un número entre 0 y 5' });
      }
    }

    const nota = await Nota.findByPk(id);
    if (!nota) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    // Actualizar la nota con validaciones
    await nota.update({
      valor: valor !== undefined ? parseFloat(valor) : nota.valor,
      observaciones: observaciones !== undefined ? observaciones : nota.observaciones
    });

    // Recalcular y actualizar el promedio
    const nuevoPromedio = await calcularYActualizarPromedio(nota.estudiante_id);

    // Devolver la nota actualizada y el nuevo promedio
    res.json({
      nota,
      promedio: nuevoPromedio
    });
  } catch (error) {
    console.error('Error al actualizar nota:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/notas/:id
notasRouter.delete('/:id', async (req, res) => {
  try {
    // Verificar autenticación
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar permisos - solo profesores y admins pueden eliminar notas
    if (req.user.role !== 'profesor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para eliminar notas' });
    }

    const { id } = req.params;
    const nota = await Nota.findByPk(id);
    
    if (!nota) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    const estudianteId = nota.estudiante_id;
    await nota.destroy();
    const nuevoPromedio = await calcularYActualizarPromedio(estudianteId);
    
    // Enviar el nuevo promedio en la respuesta
    res.json({ 
      message: 'Nota eliminada exitosamente',
      promedio: nuevoPromedio 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = notasRouter;

