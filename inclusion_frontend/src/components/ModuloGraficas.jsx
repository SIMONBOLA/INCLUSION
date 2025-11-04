import { useState, useEffect } from 'react'
import { Bar, Line, Pie } from 'react-chartjs-2'
import { obtenerNotasPorEstudiante } from '../services/notas'
import '../styles/ModuloGraficas.css'
import ChartDataLabels from 'chartjs-plugin-datalabels';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Registrar Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
)

const ModuloGraficas = ({ estudianteSeleccionado, actualizacionNotas }) => {
  const [datosGrafica, setDatosGrafica] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [tipoGrafica, setTipoGrafica] = useState('bar') // bar, line, pie

  useEffect(() => {
    const cargarDatosGrafica = async () => {
      if (!estudianteSeleccionado?.id) {
        console.log('No hay ID de estudiante para cargar gráficas') // Para depuración
        return
      }

      try {
        setCargando(true)
        console.log('ModuloGraficas - Estudiante seleccionado:', estudianteSeleccionado)
        console.log('Cargando datos para estudiante ID:', estudianteSeleccionado.id) // Para depuración
        const respuesta = await obtenerNotasPorEstudiante(estudianteSeleccionado.id)
        console.log('ModuloGraficas - Respuesta de notas:', respuesta)
        const notasArray = respuesta.notas || []

        // Agrupar por materia tomando la nota más reciente
        const notasPorMateria = {}
        notasArray.forEach(nota => {
          const materiaKey = nota.materia?.nombre || nota.materia_id
          if (
            !notasPorMateria[materiaKey] ||
            new Date(nota.fecha) > new Date(notasPorMateria[materiaKey].fecha)
          ) {
            notasPorMateria[materiaKey] = nota
          }
        })

        const materias = Object.keys(notasPorMateria)
        const notasActuales = materias.map(
          materia => Number(notasPorMateria[materia].valor)
        )

        const colorPalette = [
          '#4A90E2', '#50E3C2', '#F5A623', '#B8E986', '#D0021B', '#F8E71C', '#7ED321', '#417505', '#9013FE', '#8B572A'
        ];
        const backgroundColors = materias.map((_, i) => colorPalette[i % colorPalette.length] + '99'); // con transparencia
        const borderColors = materias.map((_, i) => colorPalette[i % colorPalette.length]);

        setDatosGrafica({
          labels: materias,
          datasets: [
            {
              label: 'Nota',
              data: notasActuales,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 2
            }
          ]
        })

      } catch (error) {
        console.error('Error al cargar datos de la gráfica:', error)
      } finally {
        setCargando(false)
      }
    }

    cargarDatosGrafica()
  }, [estudianteSeleccionado, actualizacionNotas])

  const opcionesGrafica = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 12 } }
      },
      title: {
        display: true,
        text: `Notas del estudiante: ${estudianteSeleccionado?.name || estudianteSeleccionado?.nombre || ''}`,
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: { stepSize: 0.5 }
      }
    }
  }

  if (!estudianteSeleccionado) {
    return <div className="mensaje-seleccion">Seleccione un estudiante para ver sus gráficas</div>
  }

  if (cargando) {
    return <div className="cargando">Cargando gráficas...</div>
  }

  return (
    <div>
      <div className="encabezado-graficas">
        <h2>
          Gráficas del estudiante {estudianteSeleccionado?.nombre || estudianteSeleccionado?.name || ''} <span style={{fontSize: '1rem', color: '#888', fontWeight: 400}}>(ID: {estudianteSeleccionado?.id})</span>
        </h2>
      </div>

      {/* Botones para cambiar el tipo de gráfica */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
        <button onClick={() => setTipoGrafica('bar')} style={{ padding: '0.5rem 1rem', background: tipoGrafica === 'bar' ? '#4a90e2' : '#e2e8f0', color: tipoGrafica === 'bar' ? '#fff' : '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Barras</button>
        <button onClick={() => setTipoGrafica('line')} style={{ padding: '0.5rem 1rem', background: tipoGrafica === 'line' ? '#4a90e2' : '#e2e8f0', color: tipoGrafica === 'line' ? '#fff' : '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Líneas</button>
        <button onClick={() => setTipoGrafica('pie')} style={{ padding: '0.5rem 1rem', background: tipoGrafica === 'pie' ? '#4a90e2' : '#e2e8f0', color: tipoGrafica === 'pie' ? '#fff' : '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Pastel</button>
      </div>

      <div className="contenedor-grafica">
        {datosGrafica ? (
          tipoGrafica === 'bar' ? (
            <Bar data={datosGrafica} options={opcionesGrafica} />
          ) : tipoGrafica === 'line' ? (
            <Line data={datosGrafica} options={{
              ...opcionesGrafica,
              plugins: {
                ...opcionesGrafica.plugins,
                datalabels: { display: false }
              }
            }} />
          ) : (
            <>
              <Pie
                data={datosGrafica}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        generateLabels: (chart) => {
                          const data = chart.data;
                          if (data.labels.length && data.datasets.length) {
                            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                            return data.labels.map((label, i) => {
                              const value = data.datasets[0].data[i];
                              const percent = ((value / total) * 100).toFixed(1);
                              return {
                                text: `${label} [${percent}%]`,
                                fillStyle: data.datasets[0].backgroundColor[i],
                                strokeStyle: data.datasets[0].borderColor[i],
                                lineWidth: 2,
                                hidden: isNaN(value),
                                index: i
                              };
                            });
                          }
                          return [];
                        }
                      }
                    },
                    datalabels: {
                      color: '#fff',
                      font: { weight: 'bold', size: 14 },
                      formatter: (value, ctx) => {
                        const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        return `${((value / total) * 100).toFixed(1)}%`;
                      }
                    }
                  }
                }}
              />
              <div style={{textAlign: 'center', color: '#555', fontSize: '1rem'}}>
                <strong>¿Qué significa el porcentaje?</strong><br />
                El porcentaje representa la participación de cada materia en el total de notas del estudiante. Por ejemplo, si una materia tiene 5 y el total de todas las notas es 20, su porcentaje será 25%.
              </div>
            </>
          )
        ) : (
          <div className="sin-datos">No hay datos disponibles</div>
        )}
      </div>

    </div>
  )
}

export default ModuloGraficas
