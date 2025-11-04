import axios from './axios';

const getAll = async () => {
  const response = await axios.get('/usuarios');
  return response.data;
};

const deleteUser = async (userId) => {
  const response = await axios.delete(`/usuarios/${userId}`);
  return response.data;
};

const getEstudiantes = async () => {
  const response = await axios.get('/usuarios/estudiantes');
  return response.data;
};

const uploadBulkUsers = async (formData) => {
  const response = await axios.post('/upload/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export default { getAll, deleteUser, getEstudiantes, uploadBulkUsers };