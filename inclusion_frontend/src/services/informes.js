import axios from 'axios';

const baseUrl = '/api/informes';

// Configuración del token
const getConfig = () => {
  const loggedUserJSON = window.localStorage.getItem('loggedUser');
  if (loggedUserJSON) {
    const user = JSON.parse(loggedUserJSON);
    return {
      headers: { Authorization: `Bearer ${user.token}` }
    };
  }
  return {};
};

const crearInforme = async (data) => {
  const response = await axios.post(baseUrl, data, getConfig());
  return response.data;
};

const obtenerInformesPorEstudiante = async (estudianteId) => {
  const response = await axios.get(`${baseUrl}/estudiante/${estudianteId}`, getConfig());
  return response.data;
};

const obtenerInformesPorProfesor = async (profesorId) => {
  const response = await axios.get(`${baseUrl}/profesor/${profesorId}`, getConfig());
  return response.data;
};

const obtenerInformePorId = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`, getConfig());
  return response.data;
};

// Actualizar informe
const actualizarInforme = async (id, data) => {
  const response = await axios.put(`${baseUrl}/${id}`, data, getConfig());
  return response.data;
};

// Eliminar informe
const eliminarInforme = async (id) => {
  const response = await axios.delete(`${baseUrl}/${id}`, getConfig());
  return response.data;
};

// Descargar informe
const descargarInforme = async (id) => {
  const config = getConfig();
  config.headers = {
    ...config.headers,
    'Accept': 'application/pdf',
    'Content-Type': 'application/pdf',
  };
  config.responseType = 'blob';
  
  const response = await axios.get(`${baseUrl}/${id}/descargar`, config);
  return response.data;
};

export default {
  crearInforme,
  obtenerInformesPorEstudiante,
  descargarInforme,
  obtenerInformesPorProfesor,
  obtenerInformePorId,
  actualizarInforme,
  eliminarInforme
};
