export const estudiantesMock = [
  {
    id: 1,
    username: 'ana2023',
    nombre: 'Ana García',
    correo: 'ana.garcia@demo.com',
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
    }
  },
  {
    id: 2,
    username: 'carlos_m',
    nombre: 'Carlos Martínez',
    correo: 'carlos.martinez@demo.com',
    is_online: false,
    grupo: '3A',
    promedio: 7.8,
    asistencia: 88,
    notas: [
      { id: 4, materia: 'Matemáticas', valor: 7.5, fecha: '2023-09-01' },
      { id: 5, materia: 'Lenguaje', valor: 8.0, fecha: '2023-09-05' },
      { id: 6, materia: 'Ciencias', valor: 7.8, fecha: '2023-09-10' }
    ],
    progreso: {
      matematicas: 75,
      lenguaje: 80,
      ciencias: 78,
      historia: 82
    }
  },
  {
    id: 3,
    username: 'laura_p',
    nombre: 'Laura Pérez',
    correo: 'laura.perez@demo.com',
    is_online: true,
    grupo: '3B',
    promedio: 9.2,
    asistencia: 98,
    notas: [
      { id: 7, materia: 'Matemáticas', valor: 9.5, fecha: '2023-09-01' },
      { id: 8, materia: 'Lenguaje', valor: 9.0, fecha: '2023-09-05' },
      { id: 9, materia: 'Ciencias', valor: 9.2, fecha: '2023-09-10' }
    ],
    progreso: {
      matematicas: 95,
      lenguaje: 90,
      ciencias: 92,
      historia: 94
    }
  }
];