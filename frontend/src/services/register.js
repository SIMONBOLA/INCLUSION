import axios from 'axios'

const baseUrl = '/api/register'

const register = async (userData) => {
  try {
    const response = await axios.post(baseUrl, userData)
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

export default { register }