import axios from 'axios'

const baseUrl = '/api/users'

const obtenerEstudiantes = async () => {
  try {
    const response = await axios.get(`${baseUrl}/estudiantes`, {
      headers: {
        'Accept': 'application/json'
      }
    })
    console.log('URL de la petición:', `${baseUrl}/estudiantes`)
    console.log('Respuesta del servidor:', response.data)
    return response.data
  } catch (error) {
    console.error('Error al obtener estudiantes:', error.response?.data || error.message)
    if (error.response?.status === 404) {
      return [] // Retornar array vacío si no hay estudiantes
    }
    throw error
  }
}

const obtenerEstudiantePorId = async (id) => {
  try {
    const response = await axios.get(`${baseUrl}/estudiantes/${id}`)
    console.log('Datos del estudiante:', response.data) // Para depuración
    return response.data
  } catch (error) {
    console.error('Error al obtener estudiante:', error)
    throw error
  }
}

const actualizarEstudiante = async (id, datos) => {
  try {
    const response = await axios.put(`${baseUrl}/estudiantes/${id}`, datos)
    console.log('Estudiante actualizado:', response.data) // Para depuración
    return response.data
  } catch (error) {
    console.error('Error al actualizar estudiante:', error)
    throw error
  }
}

export default {
  obtenerEstudiantes,
  obtenerEstudiantePorId,
  actualizarEstudiante
}