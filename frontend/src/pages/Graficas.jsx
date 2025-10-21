import { useState, useEffect } from 'react';
import { Bar, Line, Radar } from 'react-chartjs-2';
import axios from 'axios';
import './graficas.css';
import api from '../services/axios';

const Graficas = () => {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [grades, setGrades] = useState([]);

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
      const studentInfo = students.find(s => s.id === parseInt(studentId));
      setSelectedStudent(studentInfo);
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  };

  const chartData = {
    labels: grades.map(grade => grade.subject),
    datasets: [
      {
        label: 'Nota Anterior',
        data: grades.map(grade => grade.previous_grade),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2
      },
      {
        label: 'Nota Actual',
        data: grades.map(grade => grade.current_grade),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 2
      }
    ]
  };

  const radarData = {
    labels: grades.map(grade => grade.subject),
    datasets: [
      {
        label: 'Rendimiento General',
        data: grades.map(grade => grade.current_grade),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(75, 192, 192, 1)'
      }
    ]
  };

  const lineData = {
    labels: grades.map(grade => grade.subject),
    datasets: [
      {
        label: 'Progreso del Estudiante',
        data: grades.map(grade => grade.current_grade - grade.previous_grade),
        fill: true,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: selectedStudent ? `Rendimiento de ${selectedStudent.nombre}` : 'Rendimiento Académico'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5
      }
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {user?.role === 'profesor' && (
          <div className="selector-wrapper">
            <div className="selector-content">
              <h2>Seleccionar Estudiante</h2>
              <select
                onChange={(e) => loadStudentGrades(e.target.value)}
                defaultValue=""
                className="student-select"
              >
                <option value="" disabled>Selecciona un estudiante</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {grades.length > 0 ? (
          <div className="dashboard-grid">
            <div className="chart-wrapper">
              <div className="chart-content">
                <h3>Comparativa de Notas</h3>
                <div className="chart-container">
                  <Bar data={chartData} options={options} />
                </div>
              </div>
            </div>
            
            <div className="chart-wrapper">
              <div className="chart-content">
                <h3>Análisis de Competencias</h3>
                <div className="chart-container">
                  <Radar data={radarData} options={options} />
                </div>
              </div>
            </div>
            
            <div className="chart-wrapper">
              <div className="chart-content">
                <h3>Progreso del Estudiante</h3>
                <div className="chart-container">
                  <Line data={lineData} options={options} />
                </div>
              </div>
            </div>

            <div className="stats-wrapper">
              <div className="stats-content">
                <h3>Estadísticas Generales</h3>
                <div className="stats-grid">
                  <div className="stat-box">
                    <span className="stat-title">Promedio</span>
                    <span className="stat-number">
                      {(grades.reduce((acc, grade) => acc + grade.current_grade, 0) / grades.length).toFixed(2)}
                    </span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-title">Materias</span>
                    <span className="stat-number">{grades.length}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-title">Mayor Nota</span>
                    <span className="stat-number">
                      {Math.max(...grades.map(grade => grade.current_grade))}
                    </span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-title">Menor Nota</span>
                    <span className="stat-number">
                      {Math.min(...grades.map(grade => grade.current_grade))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data-wrapper">
            <div className="no-data-content">
              <h3>No hay datos disponibles</h3>
              <p>No se encontraron notas para mostrar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Graficas;