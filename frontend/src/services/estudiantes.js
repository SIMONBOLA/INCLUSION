import axios from 'axios';
import { estudiantesMock } from '../mocks/estudiantes';

const baseUrl = '/api/estudiantes';

const isTokenValid = () => {
  const token = window.localStorage.getItem('userToken');
  if (!token) return false;
  
  try {
    // Decodificar JWT (formato: header.payload.signature)
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Verificar si el token ha expirado
    return payload.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
};

const obtenerEstudiantes = async () => {
  try {
    // Si no hay token válido, retornar datos mock
    if (!isTokenValid()) {
      console.log('Usando datos mock para estudiantes');
      return estudiantesMock;
    }

    const token = window.localStorage.getItem('userToken');
    const response = await axios.get(baseUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.ok ? response.data.data : estudiantesMock;
  } catch (error) {
    console.warn('Fallback a datos mock:', error.message);
    return estudiantesMock;
  }
};

const obtenerEstudiantePorId = async (id) => {
  if (!id) {
    console.warn('ID de estudiante no proporcionado, usando datos mock');
    return estudiantesMock.find(e => e.id === 1) || null;
  }

  try {
    if (!isTokenValid()) {
      const estudiante = estudiantesMock.find(e => e.id === parseInt(id));
      if (!estudiante) throw new Error('Estudiante no encontrado');
      return estudiante;
    }

    const token = window.localStorage.getItem('userToken');
    const response = await axios.get(`${baseUrl}/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.ok ? response.data.data : null;
  } catch (error) {
    console.warn('Error al obtener estudiante, usando datos mock:', error.message);
    return estudiantesMock.find(e => e.id === parseInt(id)) || null;
  }
};

const actualizarEstudiante = async (id, datos) => {
  try {
    if (!isTokenValid()) {
      console.warn('No hay token válido para actualizar estudiante');
      return datos; // Simular actualización exitosa
    }

    const token = window.localStorage.getItem('userToken');
    const response = await axios.put(
      `${baseUrl}/${id}`, 
      datos,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data.ok ? response.data.data : datos;
  } catch (error) {
    console.warn('Error al actualizar estudiante:', error.message);
    return datos; // Retornar los mismos datos para simular actualización
  }
};

const obtenerNotas = async (id) => {
  if (!id) {
    console.warn('ID de estudiante no proporcionado para notas, usando datos mock');
    return estudiantesMock[0].notas;
  }

  try {
    if (!isTokenValid()) {
      const estudiante = estudiantesMock.find(e => e.id === parseInt(id));
      return estudiante ? estudiante.notas : [];
    }

    const token = window.localStorage.getItem('userToken');
    const response = await axios.get(`${baseUrl}/${id}/notas`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.ok ? response.data.data : [];
  } catch (error) {
    console.warn('Error al obtener notas, usando datos mock:', error.message);
    const estudiante = estudiantesMock.find(e => e.id === parseInt(id));
    return estudiante ? estudiante.notas : [];
  }
};

const obtenerHistorial = async (id) => {
  if (!id) {
    console.warn('ID de estudiante no proporcionado para historial, usando datos mock');
    return estudiantesMock[0].historial;
  }

  try {
    if (!isTokenValid()) {
      const estudiante = estudiantesMock.find(e => e.id === parseInt(id));
      return estudiante ? estudiante.historial : [];
    }

    const token = window.localStorage.getItem('userToken');
    const response = await axios.get(`${baseUrl}/${id}/historial`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.ok ? response.data.data : [];
  } catch (error) {
    console.warn('Error al obtener historial, usando datos mock:', error.message);
    const estudiante = estudiantesMock.find(e => e.id === parseInt(id));
    return estudiante ? estudiante.historial : [];
  }
};

const obtenerProgreso = async (id) => {
  if (!id) {
    console.warn('ID de estudiante no proporcionado para progreso, usando datos mock');
    return estudiantesMock[0].progreso;
  }

  try {
    if (!isTokenValid()) {
      const estudiante = estudiantesMock.find(e => e.id === parseInt(id));
      return estudiante ? estudiante.progreso : null;
    }

    const token = window.localStorage.getItem('userToken');
    const response = await axios.get(`${baseUrl}/${id}/progreso`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.ok ? response.data.data : null;
  } catch (error) {
    console.warn('Error al obtener progreso, usando datos mock:', error.message);
    const estudiante = estudiantesMock.find(e => e.id === parseInt(id));
    return estudiante ? estudiante.progreso : null;
  }
};

// API pública del servicio
export default {
  obtenerEstudiantes,
  obtenerEstudiantePorId,
  actualizarEstudiante,
  obtenerNotas,
  obtenerHistorial,
  obtenerProgreso,
  // Exponer función de validación de token para otros servicios
  isTokenValid
};