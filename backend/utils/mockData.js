// Datos mock centralizados para desarrollo y testing
const estudiantesMock = [
  {
    id: 1,
    username: 'ana_t',
    nombre: 'Ana Torres',
    correo: 'ana@demo.com',
    is_online: true,
    grupo: '3A',
    promedio: 8.7,
    asistencia: 95,
    notas: [
      { id: 1, materia: 'Matemáticas', valor: 8.5, fecha: '2025-10-15' },
      { id: 2, materia: 'Lenguaje', valor: 9.0, fecha: '2025-10-15' },
      { id: 3, materia: 'Ciencias', valor: 8.6, fecha: '2025-10-15' }
    ],
    historial: [
      { semana: '2025-W42', promedio: 8.7, asistencia: 95 },
      { semana: '2025-W41', promedio: 8.5, asistencia: 90 },
      { semana: '2025-W40', promedio: 8.3, asistencia: 100 }
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
    is_online: false,
    grupo: '3A',
    promedio: 7.8,
    asistencia: 88,
    notas: [
      { id: 4, materia: 'Matemáticas', valor: 7.5, fecha: '2025-10-15' },
      { id: 5, materia: 'Lenguaje', valor: 8.0, fecha: '2025-10-15' },
      { id: 6, materia: 'Ciencias', valor: 8.0, fecha: '2025-10-15' }
    ],
    historial: [
      { semana: '2025-W42', promedio: 7.8, asistencia: 88 },
      { semana: '2025-W41', promedio: 7.5, asistencia: 85 },
      { semana: '2025-W40', promedio: 7.2, asistencia: 90 }
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
    is_online: true,
    grupo: '3B',
    promedio: 9.2,
    asistencia: 98,
    notas: [
      { id: 7, materia: 'Matemáticas', valor: 9.5, fecha: '2025-10-15' },
      { id: 8, materia: 'Lenguaje', valor: 9.0, fecha: '2025-10-15' },
      { id: 9, materia: 'Ciencias', valor: 9.0, fecha: '2025-10-15' }
    ],
    historial: [
      { semana: '2025-W42', promedio: 9.2, asistencia: 98 },
      { semana: '2025-W41', promedio: 9.0, asistencia: 100 },
      { semana: '2025-W40', promedio: 8.8, asistencia: 95 }
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
    is_online: true,
    grupo: '3B',
    promedio: 8.0,
    asistencia: 92,
    notas: [
      { id: 10, materia: 'Matemáticas', valor: 8.0, fecha: '2025-10-15' },
      { id: 11, materia: 'Lenguaje', valor: 8.0, fecha: '2025-10-15' },
      { id: 12, materia: 'Ciencias', valor: 8.0, fecha: '2025-10-15' }
    ],
    historial: [
      { semana: '2025-W42', promedio: 8.0, asistencia: 92 },
      { semana: '2025-W41', promedio: 7.8, asistencia: 90 },
      { semana: '2025-W40', promedio: 7.5, asistencia: 95 }
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
    is_online: false,
    grupo: '3A',
    promedio: 8.5,
    asistencia: 94,
    notas: [
      { id: 13, materia: 'Matemáticas', valor: 8.5, fecha: '2025-10-15' },
      { id: 14, materia: 'Lenguaje', valor: 8.5, fecha: '2025-10-15' },
      { id: 15, materia: 'Ciencias', valor: 8.5, fecha: '2025-10-15' }
    ],
    historial: [
      { semana: '2025-W42', promedio: 8.5, asistencia: 94 },
      { semana: '2025-W41', promedio: 8.3, asistencia: 92 },
      { semana: '2025-W40', promedio: 8.0, asistencia: 96 }
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

module.exports = {
  estudiantesMock,
  getEstudiantePorId,
  getNotasEstudiante,
  getHistorialEstudiante,
  getProgresoEstudiante
};