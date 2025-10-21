import axios from 'axios';

const baseUrl = '/api/users/students';

const getAll = () => {
  return axios.get(baseUrl).then(response => response.data);
};

const getGrades = (studentId) => {
  return axios.get(`${baseUrl}/${studentId}/grades`).then(response => response.data);
};

const addGrade = (studentId, gradeData) => {
  return axios.post(`${baseUrl}/${studentId}/grades`, gradeData).then(response => response.data);
};

export default { getAll, getGrades, addGrade };