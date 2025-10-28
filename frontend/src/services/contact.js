import axios from 'axios';

const baseUrl = '/api/contact';

const sendContactMessage = async (contactData) => {
  try {
    const response = await axios.post(baseUrl, contactData);
    return response.data;
  } catch (error) {
    console.error('Error al enviar mensaje:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Error al enviar el mensaje');
  }
};

export default { sendContactMessage };