import axios from 'axios'

const baseUrl = '/api/mensajes'

// Obtener mensajes de un chat específico
const getMensajes = async (estudianteId) => {
  try {
    if (!estudianteId) {
      throw new Error('ID de estudiante no proporcionado')
    }
    const response = await axios.get(`${baseUrl}/${estudianteId}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener mensajes:', error.response?.data || error.message)
    throw new Error(error.response?.data?.error || 'Error al cargar los mensajes')
  }
}

// Enviar un nuevo mensaje
const enviarMensaje = async (mensaje) => {
  try {
    const response = await axios.post(baseUrl, mensaje)
    return response.data
  } catch (error) {
    console.error('Error al enviar mensaje:', error.response?.data || error.message)
    throw new Error(error.response?.data?.error || 'Error al enviar el mensaje')
  }
}

const mensajesService = {
  getMensajes,
  enviarMensaje
}

export default mensajesService