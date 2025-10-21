import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/axios';

const Notas = () => {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [newPreviousGrade, setNewPreviousGrade] = useState('');
  const [newCurrentGrade, setNewCurrentGrade] = useState('');

  useEffect(() => {
    const loggedUser = window.localStorage.getItem('loggedUser');
    if (loggedUser) {
      const user = JSON.parse(loggedUser);
      setUser(user);
      if (user.role === 'profesor') {
        loadStudents();
      } else if (user.role === 'estudiante') {
        loadStudentGrades(user.id);
      }
    }
  }, []);

  const loadStudents = async () => {
    try {
      const response = await api.get('/usuarios/estudiantes');
      setStudents(response.data);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadStudentGrades = async (studentId) => {
    try {
      const response = await axios.get(`/api/users/students/${studentId}/grades`);
      setGrades(response.data);
      setSelectedStudent({
        id: studentId,
        grades: response.data
      });
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  };

  const handleSelectStudent = async (studentId) => {
    await loadStudentGrades(studentId);
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/users/students/${selectedStudent.id}/grades`, {
        subject: newSubject,
        previousGrade: newPreviousGrade,
        currentGrade: newCurrentGrade
      });
      setGrades([...grades, response.data]);
      setNewSubject('');
      setNewPreviousGrade('');
      setNewCurrentGrade('');
    } catch (error) {
      console.error('Error adding grade:', error);
    }
  };

  return (
    <div className="grades-page">
      {user?.role === 'profesor' ? (
        <>
          <section className="select-student">
            <h2>Seleccionar Estudiante</h2>
            <select
              onChange={(e) => handleSelectStudent(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Selecciona un estudiante</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.nombre}
                </option>
              ))}
            </select>
          </section>

          {selectedStudent && (
            <>
              <section className="grades-history">
                <h2>Notas del Estudiante</h2>
                <table className="grades-table">
                  <thead>
                    <tr>
                      <th>Materia</th>
                      <th>Nota Anterior</th>
                      <th>Nota Actual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade) => (
                      <tr key={grade.id}>
                        <td>{grade.subject}</td>
                        <td>{grade.previous_grade}</td>
                        <td>{grade.current_grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="add-grades">
                <h2>Agregar Nueva Nota</h2>
                <form onSubmit={handleAddGrade}>
                  <input
                    type="text"
                    placeholder="Materia"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Nota Anterior"
                    value={newPreviousGrade}
                    onChange={(e) => setNewPreviousGrade(e.target.value)}
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Nota Actual"
                    value={newCurrentGrade}
                    onChange={(e) => setNewCurrentGrade(e.target.value)}
                  />
                  <button type="submit">Agregar</button>
                </form>
              </section>
            </>
          )}
        </>
      ) : (
        <div className="student-view">
          <h2>Mis Notas</h2>
          <table className="grades-table">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Nota Anterior</th>
                <th>Nota Actual</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id}>
                  <td>{grade.subject}</td>
                  <td>{grade.previous_grade}</td>
                  <td>{grade.current_grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Notas;