import { useState, useRef, useEffect } from 'react'
import SelectorEstudiantes from '../components/SelectorEstudiantes'
import ModuloGraficas from '../components/ModuloGraficas'
import ModuloNotas from '../components/ModuloNotas'
import estudiantesService from '../services/estudiantes'
import '../styles/GraficasNotas.css'

const GraficasNotas = () => {
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null)
  const [estudianteId, setEstudianteId] = useState(null)
  const [actualizacionNotas, setActualizacionNotas] = useState(0)
  const actualizacionRef = useRef(0)

  // ✅ Cargar usuario actual
  useEffect(() => {
    const cargarDatos = async () => {
      const loggedUser = window.localStorage.getItem('loggedUser')
      if (loggedUser) {
        const user = JSON.parse(loggedUser)
        setUsuarioActual(user)
        if (user.role === 'estudiante') {
          try {
            // Buscar el estudiante_id real
            const estudiantes = await estudiantesService.obtenerEstudiantes()
            console.log('Estudiantes obtenidos:', estudiantes) // Para depuración
            const est = estudiantes.find(e => e.user_id === user.id)
            if (est) {
              console.log('Estudiante encontrado:', est) // Para depuración
              // Tomar el nombre del usuario relacionado si existe
              const nombreEst = est.usuario?.nombre || est.nombre || est.name || '';
              const estudianteNormalizado = {
                ...est,
                nombre: nombreEst,
                id: est.id
              };
              setEstudianteSeleccionado(estudianteNormalizado)
              setEstudianteId(est.id)
            } else {
              console.log('No se encontró el estudiante para user_id:', user.id) // Para depuración
            }
          } catch (error) {
            console.error('Error al obtener estudiantes:', error)
          }
        }
      }
    }
    cargarDatos()
  }, [])

  // ✅ Notificar actualización de notas
  const handleNotaActualizada = () => {
    actualizacionRef.current += 1
    setActualizacionNotas(actualizacionRef.current)
  }

  return (
    <div className="pagina-graficas">
      
      {/* CONTENEDOR GENERAL (IGUAL QUE EN NOTAS) */}
      <div className="layout-graficas">

        {/* COLUMNA IZQUIERDA */}
        <div className="selector-container">
          {usuarioActual?.role === 'profesor' && (
            <SelectorEstudiantes
              onSeleccionEstudiante={setEstudianteSeleccionado}
              usuarioActual={usuarioActual}
            />
          )}
        </div>

        {/* COLUMNA DERECHA (NOTAS + GRÁFICAS) */}
        <div className="graficas-content">

          {/* MÓDULO NOTAS */}
          <ModuloNotas
            estudianteSeleccionado={usuarioActual?.role === 'estudiante' ? { ...estudianteSeleccionado, id: estudianteId } : estudianteSeleccionado}
            usuarioActual={usuarioActual}
            onNotaActualizada={handleNotaActualizada}
          />

          {/* MÓDULO GRÁFICAS */}
          <ModuloGraficas
            estudianteSeleccionado={usuarioActual?.role === 'estudiante' ? { ...estudianteSeleccionado, id: estudianteId } : estudianteSeleccionado}
            usuarioActual={usuarioActual}
            actualizacionNotas={actualizacionNotas}
          />

        </div>
      </div>

    </div>
  )
}

export default GraficasNotas
