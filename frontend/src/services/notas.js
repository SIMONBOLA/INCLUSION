import axios from 'axios'

const baseUrl = '/api/users/estudiantes'

const obtenerNotasEstudiante = async (idEstudiante) => {
  if (!idEstudiante) {
    console.warn('ID de estudiante no proporcionado')
    return []
  }

  try {
    const response = await axios.get(`${baseUrl}/${idEstudiante}/notas`)
    return response.data || []
  } catch (error) {
    console.error('Error al obtener notas:', error.response?.data || error.message)
    if (error.response?.status === 404) {
      return [] // Retornar array vacío si no hay notas
    }
    throw new Error('Error al obtener las notas del estudiante')
  }
}

const actualizarNota = async (idEstudiante, datosNota) => {
  try {
    const response = await axios.put(`${baseUrl}/${idEstudiante}/notas`, datosNota)
    return response.data
  } catch (error) {
    console.error('Error al actualizar nota:', error)
    throw error
  }
}

const obtenerHistorialNotas = async (idEstudiante) => {
  try {
    const response = await axios.get(`${baseUrl}/${idEstudiante}/notas/historial`)
    return response.data
  } catch (error) {
    console.error('Error al obtener historial:', error)
    throw error
  }
}

const crearNota = async (idEstudiante, datosNota) => {
  try {
    const response = await axios.post(`${baseUrl}/${idEstudiante}/notas`, datosNota)
    return response.data
  } catch (error) {
    console.error('Error al crear nota:', error)
    throw error
  }
}

export default {
  obtenerNotasEstudiante,
  actualizarNota,
  obtenerHistorialNotas,
  crearNota
}