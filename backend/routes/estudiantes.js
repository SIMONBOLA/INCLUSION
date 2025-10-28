const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Mock data y helpers para desarrollo
const estudiantesMock = [
  {
    id: 1,
    username: 'ana_t',
    nombre: 'Ana Torres',
    correo: 'ana@demo.com',
    grupo: '3A',
    promedio: 8.7,
    asistencia: 95,
    notas: [
      { id: 1, materia: 'Matemáticas', valor: 8.5, fecha: '2025-10-15' },
      { id: 2, materia: 'Lenguaje', valor: 9.0, fecha: '2025-10-15' },
      { id: 3, materia: 'Ciencias', valor: 8.6, fecha: '2025-10-15' }
    ],
    historial: [
      { semana: '2025-W42', promedio: 8.7 },
      { semana: '2025-W41', promedio: 8.5 },
      { semana: '2025-W40', promedio: 8.3 }
    ],
    progreso: {
      matematicas: 85,
      lenguaje: 90,
      ciencias: 86
    }
  },
  {
    id: 2,
    username: 'luis_g',
    nombre: 'Luis Gómez',
    correo: 'luis@demo.com',
    grupo: '3A',
    promedio: 7.8,
    asistencia: 88,
    notas: [
      { id: 4, materia: 'Matemáticas', valor: 7.5, fecha: '2025-10-15' },
      { id: 5, materia: 'Lenguaje', valor: 8.0, fecha: '2025-10-15' },
      { id: 6, materia: 'Ciencias', valor: 8.0, fecha: '2025-10-15' }
    ],
    historial: [
      { semana: '2025-W42', promedio: 7.8 },
      { semana: '2025-W41', promedio: 7.5 },
      { semana: '2025-W40', promedio: 7.2 }
    ],
    progreso: {
      matematicas: 75,
      lenguaje: 80,
      ciencias: 80
    }
  },
  {
    id: 3,
    username: 'carla_p',
    nombre: 'Carla Pérez',
    correo: 'carla@demo.com',
    grupo: '3B',
    promedio: 9.2,
    asistencia: 98,
    notas: [
      { id: 7, materia: 'Matemáticas', valor: 9.5, fecha: '2025-10-15' },
      { id: 8, materia: 'Lenguaje', valor: 9.0, fecha: '2025-10-15' },
      { id: 9, materia: 'Ciencias', valor: 9.0, fecha: '2025-10-15' }
    ],
    historial: [
      { semana: '2025-W42', promedio: 9.2 },
      { semana: '2025-W41', promedio: 9.0 },
      { semana: '2025-W40', promedio: 8.8 }
    ],
    progreso: {
      matematicas: 95,
      lenguaje: 90,
      ciencias: 90
    }
  },
  {
    id: 4,
    username: 'miguel_r',
    nombre: 'Miguel Rojas',
    correo: 'miguel@demo.com',
    grupo: '3B',
    promedio: 8.0,
    asistencia: 92,
    notas: [
      { id: 10, materia: 'Matemáticas', valor: 8.0, fecha: '2025-10-15' },
      { id: 11, materia: 'Lenguaje', valor: 8.0, fecha: '2025-10-15' },
      { id: 12, materia: 'Ciencias', valor: 8.0, fecha: '2025-10-15' }
    ],
    historial: [
      { semana: '2025-W42', promedio: 8.0 },
      { semana: '2025-W41', promedio: 7.8 },
      { semana: '2025-W40', promedio: 7.5 }
    ],
    progreso: {
      matematicas: 80,
      lenguaje: 80,
      ciencias: 80
    }
  },
  {
    id: 5,
    username: 'sofia_l',
    nombre: 'Sofía López',
    correo: 'sofia@demo.com',
    grupo: '3A',
    promedio: 8.5,
    asistencia: 94,
    notas: [
      { id: 13, materia: 'Matemáticas', valor: 8.5, fecha: '2025-10-15' },
      { id: 14, materia: 'Lenguaje', valor: 8.5, fecha: '2025-10-15' },
      { id: 15, materia: 'Ciencias', valor: 8.5, fecha: '2025-10-15' }
    ],
    historial: [
      { semana: '2025-W42', promedio: 8.5 },
      { semana: '2025-W41', promedio: 8.3 },
      { semana: '2025-W40', promedio: 8.0 }
    ],
    progreso: {
      matematicas: 85,
      lenguaje: 85,
      ciencias: 85
    }
  }
];

// Helpers para manipular datos mock
const getEstudiantePorId = (id) => {
  return estudiantesMock.find(e => e.id === parseInt(id));
};

const getNotasEstudiante = (id) => {
  const estudiante = getEstudiantePorId(id);
  return estudiante ? estudiante.notas : [];
};

const getHistorialEstudiante = (id) => {
  const estudiante = getEstudiantePorId(id);
  return estudiante ? estudiante.historial : [];
};

const getProgresoEstudiante = (id) => {
  const estudiante = getEstudiantePorId(id);
  return estudiante ? estudiante.progreso : null;
};

// Rutas sin autenticación
// GET /api/estudiantes - Obtener lista completa
router.get('/', (req, res) => {
  try {
    logger.info('[Mock API] GET /estudiantes - Enviando lista de estudiantes mock');
    // Enviamos solo los datos básicos para la lista
    const datosBasicos = estudiantesMock.map(({ id, nombre, grupo, promedio, asistencia }) => ({
      id,
      nombre,
      grupo,
      promedio,
      asistencia
    }));
    res.json(datosBasicos);
  } catch (error) {
    logger.error('Error al obtener estudiantes:', error);
    res.status(500).json({ error: 'Error al obtener estudiantes' });
  }
});

// GET /api/estudiantes/:id - Obtener un estudiante
router.get('/:id', (req, res) => {
  try {
    const estudiante = getEstudiantePorId(req.params.id);
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    // Enviamos datos completos excepto información sensible
    const { password, ...datosPublicos } = estudiante;
    logger.info(`[Mock API] GET /estudiantes/${req.params.id} - Enviando datos mock`);
    res.json(datosPublicos);
  } catch (error) {
    logger.error('Error al obtener estudiante:', error);
    res.status(500).json({ error: 'Error al obtener estudiante' });
  }
});

// GET /api/estudiantes/:id/notas - Obtener notas y progreso académico
router.get('/:id/notas', (req, res) => {
  try {
    const estudiante = getEstudiantePorId(req.params.id);
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    const datosAcademicos = {
      notas: estudiante.notas,
      promedio: estudiante.promedio,
      progreso: estudiante.progreso,
      asistencia: estudiante.asistencia
    };

    logger.info(`[Mock API] GET /estudiantes/${req.params.id}/notas - Enviando datos académicos mock`);
    res.json(datosAcademicos);
  } catch (error) {
    logger.error('Error al obtener datos académicos:', error);
    res.status(500).json({ error: 'Error al obtener datos académicos' });
  }
});

// GET /api/estudiantes/:id/historial - Obtener historial
router.get('/:id/historial', (req, res) => {
  try {
    const historial = getHistorialEstudiante(req.params.id);
    if (!historial.length) {
      return res.status(404).json({ error: 'Historial no encontrado' });
    }
    logger.info(`[Mock API] GET /estudiantes/${req.params.id}/historial - Enviando historial mock`);
    res.json(historial);
  } catch (error) {
    logger.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// GET /api/estudiantes/:id/progreso - Obtener progreso detallado
router.get('/:id/progreso', (req, res) => {
  try {
    const progreso = getProgresoEstudiante(req.params.id);
    if (!progreso) {
      return res.status(404).json({ error: 'Progreso no encontrado' });
    }
    logger.info(`[Mock API] GET /estudiantes/${req.params.id}/progreso - Enviando progreso mock`);
    res.json(progreso);
  } catch (error) {
    logger.error('Error al obtener progreso:', error);
    res.status(500).json({ error: 'Error al obtener progreso' });
  }
});

module.exports = router;