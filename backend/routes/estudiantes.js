const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const authMiddleware = require('../middlewares/auth');

// Mock data para estudiantes
const estudiantesFicticios = [
  {
    id: 1,
    username: 'ana2023',
    nombre: 'Ana García',
    role: 'estudiante',
    created_at: '2023-01-15T08:00:00Z',
    is_online: true,
    grupo: '3A',
    promedio: 8.5,
    asistencia: 95,
    notas: [
      { id: 1, materia: 'Matemáticas', valor: 8.5, fecha: '2023-09-01' },
      { id: 2, materia: 'Lenguaje', valor: 9.0, fecha: '2023-09-05' },
      { id: 3, materia: 'Ciencias', valor: 8.0, fecha: '2023-09-10' }
    ],
    progreso: {
      matematicas: 85,
      lenguaje: 90,
      ciencias: 80,
      historia: 88
    },
    participacion: [
      { semana: '2023-W35', valor: 75 },
      { semana: '2023-W36', valor: 85 },
      { semana: '2023-W37', valor: 90 },
      { semana: '2023-W38', valor: 88 }
    ],
    comentarios: [
      { id: 1, texto: 'Excelente participación en clase', fecha: '2023-09-15T10:00:00Z' },
      { id: 2, texto: 'Necesita mejorar en ejercicios prácticos', fecha: '2023-09-10T09:30:00Z' }
    ]
  },
  // Más estudiantes ficticios aquí...
];

// Middleware de verificación de rol
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

// Rutas
router.get('/', authMiddleware, verificarRol(['profesor', 'admin']), (req, res) => {
  try {
    logger.info('GET /estudiantes - Enviando lista de estudiantes');
    res.status(200).json({
      ok: true,
      data: estudiantesFicticios
    });
  } catch (error) {
    logger.error('Error al obtener estudiantes:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al obtener la lista de estudiantes'
    });
  }
});

router.get('/:id', authMiddleware, verificarRol(['profesor', 'admin']), (req, res) => {
  try {
    const estudiante = estudiantesFicticios.find(e => e.id === parseInt(req.params.id));
    if (!estudiante) {
      return res.status(404).json({
        ok: false,
        error: 'Estudiante no encontrado'
      });
    }
    
    res.status(200).json({
      ok: true,
      data: estudiante
    });
  } catch (error) {
    logger.error('Error al obtener estudiante:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al obtener el estudiante'
    });
  }
});

router.get('/:id/notas', authMiddleware, verificarRol(['profesor', 'admin']), (req, res) => {
  try {
    const estudiante = estudiantesFicticios.find(e => e.id === parseInt(req.params.id));
    if (!estudiante) {
      return res.status(404).json({
        ok: false,
        error: 'Estudiante no encontrado'
      });
    }

    res.status(200).json({
      ok: true,
      data: {
        notas: estudiante.notas,
        promedio: estudiante.promedio,
        progreso: estudiante.progreso,
        asistencia: estudiante.asistencia,
        participacion: estudiante.participacion
      }
    });
  } catch (error) {
    logger.error('Error al obtener notas:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al obtener las notas'
    });
  }
});

router.get('/:id/comentarios', authMiddleware, verificarRol(['profesor', 'admin']), (req, res) => {
  try {
    const estudiante = estudiantesFicticios.find(e => e.id === parseInt(req.params.id));
    if (!estudiante) {
      return res.status(404).json({
        ok: false,
        error: 'Estudiante no encontrado'
      });
    }

    res.status(200).json({
      ok: true,
      data: estudiante.comentarios
    });
  } catch (error) {
    logger.error('Error al obtener comentarios:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al obtener los comentarios'
    });
  }
});

module.exports = router;