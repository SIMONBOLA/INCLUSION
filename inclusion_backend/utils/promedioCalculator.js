const { Nota, Estudiante, Materia } = require('../models');

const calcularYActualizarPromedio = async (estudianteId) => {
  if (!estudianteId) {
    console.error('ID de estudiante no proporcionado');
    return 0.00;
  }

  try {
    console.log(`Calculando promedio para estudiante ID: ${estudianteId}`);
    // Obtener todas las notas del estudiante con un JOIN a materias
    const query = `
      SELECT DISTINCT ON (n.materia_id) 
        n.materia_id,
        n.valor as calificacion,
        m.nombre as materia_nombre,
        n.fecha
      FROM notas n
      JOIN materias m ON n.materia_id = m.id
      WHERE n.estudiante_id = :estudianteId
      ORDER BY n.materia_id, n.fecha DESC
    `;

    const notasRecientes = await Nota.sequelize.query(query, {
      replacements: { estudianteId },
      type: Nota.sequelize.QueryTypes.SELECT
    });

    if (!notasRecientes || notasRecientes.length === 0) {
      console.log(`No hay notas para el estudiante ${estudianteId}`);
      await Estudiante.update(
        { promedio: 0.00 },
        { where: { id: estudianteId } }
      );
      return 0.00;
    }

    console.log('Notas recuperadas:', notasRecientes);

    // Calcular el promedio
    let sumaNotas = 0;
    let cantidadNotas = 0;

    // Asegurarse de que notasRecientes es un array
    const notasArray = Array.isArray(notasRecientes) ? notasRecientes : [notasRecientes];

    notasArray.forEach(nota => {
      if (!nota) return; // Saltar notas nulas/undefined
      
      const calificacion = parseFloat(nota.calificacion);
      // Actualizado para manejar notas de 0 a 10
      if (!isNaN(calificacion) && calificacion >= 0 && calificacion <= 10) {
        sumaNotas += calificacion;
        cantidadNotas++;
        console.log(`Nota válida para ${nota.materia_nombre}: ${calificacion}`);
      } else {
        console.log(`Nota inválida ignorada: ${calificacion} para materia ${nota.materia_nombre}`);
      }
    });

    // Calcular promedio con dos decimales
    const promedioFinal = cantidadNotas > 0 ? 
      Number((sumaNotas / cantidadNotas).toFixed(2)) : 
      0.00;
      
    console.log(`Promedio calculado: ${promedioFinal} (suma: ${sumaNotas}, cantidad: ${cantidadNotas})`);

    // Actualizar el promedio en la base de datos
    await Estudiante.update(
      { promedio: promedioFinal },
      { where: { id: estudianteId } }
    );

    console.log(`Promedio actualizado para estudiante ${estudianteId}: ${promedioFinal}`);
    return promedioFinal;

  } catch (error) {
    console.error('Error al calcular promedio:', error);
    throw error;
  }
};

module.exports = calcularYActualizarPromedio;