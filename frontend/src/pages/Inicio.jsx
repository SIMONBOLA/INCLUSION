import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import api from '../services/axios';
import profilephoto from "/batman-8510027_1280.png";
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../inicio.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Inicio = () => {
  const navigate = useNavigate();
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

      // Si es profesor, cargar lista de estudiantes
      if (user.role === 'profesor') {
        loadStudents();
      } else if (user.role === 'estudiante') {
        // Si es estudiante, cargar sus propias notas
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
      
      // Actualizar las notas en el estado
      setGrades([...grades, response.data]);
      
      // Limpiar el formulario
      setNewSubject('');
      setNewPreviousGrade('');
      setNewCurrentGrade('');
    } catch (error) {
      console.error('Error adding grade:', error);
    }
  };

  const chartData = selectedStudent
    ? {
        labels: grades.map((grade) => grade.subject),
        datasets: [
          {
            label: 'Nota Anterior',
            data: grades.map((grade) => grade.previous_grade),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Nota Actual',
            data: grades.map((grade) => grade.current_grade),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
          },
        ],
      }
    : null;

  return (
    <div>
      {user ? (
        <div className="main-content">
          <header className="welcome-header">
            <div className="profile-container">
              <div className="profile-image-container">
                <img
                  src={profilephoto}
                  alt="Foto de perfil"
                  className="profile-picture"
                />
                <div className="profile-status"></div>
              </div>
              <div className="welcome-text">
                <span className="welcome-label">Bienvenido</span>
                <h1 className="user-name">{user.name}</h1>
                <span className="user-role">{user.role}</span>
              </div>
            </div>
          </header>

          <main className="main-content">
            {user.role === 'profesor' ? (
              <>
                <section className="select-student">
                  <h2>Seleccionar Estudiante</h2>
                  <select
                    onChange={(e) => handleSelectStudent(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Selecciona un estudiante
                    </option>
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
                      <h2>Notas de {selectedStudent.name}</h2>
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
                      <h2>Agregar Nueva Materia</h2>
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
              // Vista para estudiantes
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

                {/* Mostrar gráfica de rendimiento */}
                {grades.length > 0 && (
                  <section className="charts">
                    <h2>Mi Rendimiento Académico</h2>
                    <Bar data={chartData} />
                  </section>
                )}
              </div>
            )}
          </main>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default Inicio;