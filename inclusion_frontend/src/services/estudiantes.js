import api from './axios';

const baseUrl = '/estudiantes';

const obtenerEstudiantes = async () => {
  try {
    const response = await api.get(baseUrl);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estudiantes:', error.message);
    return [];
  }
};

const obtenerEstudiantePorId = async (id) => {
  if (!id) {
    throw new Error('ID de estudiante no proporcionado');
  }
  try {
    const response = await api.get(`${baseUrl}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estudiante:', error.message);
    throw error;
  }
};

const actualizarEstudiante = async (id, datos) => {
  try {
    const response = await api.put(`${baseUrl}/${id}`, datos);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar estudiante:', error.message);
    throw error;
  }
};

const obtenerNotas = async (id) => {
  if (!id) {
    console.warn('ID de estudiante no proporcionado para notas');
    return [];
  }

  try {
    const response = await api.get(`${baseUrl}/${id}/notas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener notas:', error.message);
    return [];
  }
};

const obtenerHistorial = async (id) => {
  if (!id) return [];

  try {
    const response = await api.get(`${baseUrl}/${id}/historial`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial:', error.message);
    return [];
  }
};

const obtenerProgreso = async (id) => {
  if (!id) return null;

  try {
    const response = await api.get(`${baseUrl}/${id}/progreso`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener progreso:', error.message);
    return null;
  }
};

// API pública del servicio
export default {
  obtenerEstudiantes,
  obtenerEstudiantePorId,
  actualizarEstudiante,
  obtenerNotas,
  obtenerHistorial,
  obtenerProgreso
};