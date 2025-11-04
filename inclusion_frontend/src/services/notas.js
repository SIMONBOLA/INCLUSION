import api from './axios';

// Obtiene todas las notas de un estudiante desde /api/notas/:estudianteId
export const obtenerNotasPorEstudiante = async (estudianteId) => {
  if (!estudianteId) return { notas: [], promedio: 0 };
  try {
    const res = await api.get(`/notas/${estudianteId}`);
    const notas = res.data.notas.map(nota => ({
      ...nota,
      valor: nota.valor || nota.calificacion,
      calificacion: nota.valor || nota.calificacion
    }));
    
    return {
      notas,
      promedio: Number(res.data.promedio || 0).toFixed(2)
    };
  } catch (error) {
    console.error('Error al obtener notas:', error);
    return { notas: [], promedio: "0.00" };
  }
};

// Actualiza una nota de un estudiante
// datosActualizacion debe incluir notaId y valor
export const actualizarNota = async (notaId, datosActualizacion) => {
  try {
    // El backend espera PUT /api/notas/:id
    const res = await api.put(`/notas/${notaId}`, {
      valor: datosActualizacion.valor,
      observaciones: datosActualizacion.observaciones,
      fecha: datosActualizacion.fecha,
      periodo: datosActualizacion.periodo
    });
    // La respuesta debe incluir tanto la nota como el promedio actualizado
    return {
      ...res.data,
      promedio: Number(res.data.promedio || 0).toFixed(2)
    };
  } catch (error) {
    console.error('Error al actualizar nota:', error);
    // Extraer el mensaje de error de la respuesta
    const errorMessage = error.response?.data?.error || 'Error al actualizar la nota';
    throw new Error(errorMessage);
  }
};

// Crear una nueva materia
export const crearMateria = async (nombreMateria) => {
  try {
    const res = await api.post('/materias', {
      nombre: nombreMateria
    });
    return res.data;
  } catch (error) {
    console.error('Error al crear materia:', error);
    throw error;
  }
};

// Crear una nueva nota
export const crearNota = async (estudianteId, datosNota) => {
  try {
    // Primero intentamos crear la materia
    let materia;
    try {
      materia = await crearMateria(datosNota.nombreMateria);
    } catch (error) {
      // Si la materia ya existe, intentamos obtenerla
      if (error.response?.status === 400) {
        const materias = await obtenerMaterias();
        materia = materias.find(m => m.nombre.toLowerCase() === datosNota.nombreMateria.toLowerCase());
      } else {
        throw error;
      }
    }

    // Luego creamos la nota con el ID de la materia
    const res = await api.post('/notas', {
      estudiante_id: estudianteId,
      materia_id: materia.id,
      valor: datosNota.valor,
      fecha: new Date().toISOString(),
      periodo: 'actual',
      observaciones: datosNota.observaciones
    });
    return res.data;
  } catch (error) {
    console.error('Error al crear nota:', error);
    throw error;
  }
};

// Eliminar una nota
export const eliminarNota = async (notaId) => {
  try {
    const res = await api.delete(`/notas/${notaId}`);
    return res.data;
  } catch (error) {
    console.error('Error al eliminar nota:', error);
    throw error;
  }
};

// Obtener lista de materias disponibles
export const obtenerMaterias = async () => {
  try {
    const res = await api.get('/materias');
    return res.data;
  } catch (error) {
    console.error('Error al obtener materias:', error);
    return [];
  }
};

export default {
  obtenerNotasPorEstudiante,
  actualizarNota,
  crearNota,
  crearMateria,
  eliminarNota,
  obtenerMaterias
};