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
      throw { error: 'Error en el servidor, intente más tarde' }
    }
    throw error.response?.data || { error: 'Error de conexión' }
  }
}

export default { login }