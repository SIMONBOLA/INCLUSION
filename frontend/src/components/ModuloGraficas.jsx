import { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import notasService from '../services/notas'
import '../styles/ModuloGraficas.css'

// Importaciones necesarias para Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const ModuloGraficas = ({ estudianteSeleccionado }) => {
  const [datosGrafica, setDatosGrafica] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarDatosGrafica = async () => {
      if (estudianteSeleccionado) {
        try {
          setCargando(true)
          const historialNotas = await notasService.obtenerHistorialNotas(estudianteSeleccionado.id)
          
          // Procesar datos para la gráfica
          const materias = [...new Set(historialNotas.map(nota => nota.nombreMateria))]
          const notasActuales = materias.map(materia => {
            const notasMateria = historialNotas.filter(n => n.nombreMateria === materia)
            return notasMateria[notasMateria.length - 1]?.calificacion || 0
          })
          const notasAnteriores = materias.map(materia => {
            const notasMateria = historialNotas.filter(n => n.nombreMateria === materia)
            return notasMateria[notasMateria.length - 2]?.calificacion || 0
          })

          setDatosGrafica({
            labels: materias,
            datasets: [
              {
                label: 'Nota Actual',
                data: notasActuales,
                backgroundColor: 'rgba(74, 144, 226, 0.8)',
                borderColor: 'rgba(74, 144, 226, 1)',
                borderWidth: 1
              },
              {
                label: 'Nota Anterior',
                data: notasAnteriores,
                backgroundColor: 'rgba(160, 174, 192, 0.8)',
                borderColor: 'rgba(160, 174, 192, 1)',
                borderWidth: 1
              }
            ]
          })

        } catch (error) {
          console.error('Error al cargar datos de la gráfica:', error)
        } finally {
          setCargando(false)
        }
      }
    }

    cargarDatosGrafica()
  }, [estudianteSeleccionado])

  const opcionesGrafica = {
    responsive: true,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: `Progreso de Notas - ${estudianteSeleccionado?.name || ''}`,
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 0.5
        }
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
    <div className="modulo-graficas">
      <div className="contenedor-grafica">
        {datosGrafica ? (
          <Bar data={datosGrafica} options={opcionesGrafica} />
        ) : (
          <div className="sin-datos">No hay datos disponibles</div>
        )}
      </div>
      
      {datosGrafica && (
        <div className="promedio-general">
          <h3>Promedio General</h3>
          <div className="valor-promedio">
            {(datosGrafica.datasets[0].data.reduce((a, b) => a + b, 0) / 
              datosGrafica.datasets[0].data.length).toFixed(2)}
          </div>
        </div>
      )}
    </div>
  )
}

export default ModuloGraficas