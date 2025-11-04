
const { Nota, Estudiante, Materia } = require('./models');

// Script para verificar si un estudiante tiene notas
async function verificarNotasEstudiante(estudianteId) {
  try {
    const estudiante = await Estudiante.findByPk(estudianteId);
    if (!estudiante) {
      console.log('Estudiante no encontrado');
      return;
    }
    const notas = await Nota.findAll({
      where: { estudiante_id: estudianteId },
      include: [{ model: Materia, as: 'materia' }]
    });
    if (notas.length === 0) {
      console.log('El estudiante no tiene notas registradas.');
    } else {
      console.log(`Notas para el estudiante ${estudianteId} (${estudiante.nombre || estudiante.name}):`);
      notas.forEach(nota => {
        console.log(`Materia: ${nota.materia?.nombre || nota.materia_id}, Valor: ${nota.valor}, Observaciones: ${nota.observaciones}`);
      });
    }
  } catch (error) {
    console.error('Error al verificar notas:', error);
  }
}

// Cambia el ID aquí por el del estudiante que quieres revisar
const estudianteId = 3;
verificarNotasEstudiante(estudianteId);