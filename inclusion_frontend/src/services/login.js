import axios from 'axios'

const baseUrl = '/api/login'

const login = async (credentials) => {
  console.log('Login attempt with:', credentials) // Debug log
  try {
    const response = await axios.post(baseUrl, credentials)
    return response.data
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message) // Better error logging
    if (error.response?.status === 500) {
      throw new Error('Error en el servidor: Problema de conexión con la base de datos')
    } else if (error.response?.status === 401) {
      throw new Error(error.response.data.error || 'Usuario o contraseña incorrectos')
    }
    throw new Error('Error de conexión con el servidor')
  }
}

export default { login }