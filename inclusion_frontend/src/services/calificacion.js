import axios from 'axios';
const baseUrl = '/api/calificaciones';

export const crearCalificacion = async (calificacion) => {
  const response = await axios.post(baseUrl, calificacion);
  return response.data;
};

export const obtenerCalificaciones = async (estudianteId) => {
  const response = await axios.get(`${baseUrl}/${estudianteId}`);
  return response.data;
};
export default { crearCalificacion, obtenerCalificaciones };