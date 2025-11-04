import { useState, useEffect } from 'react'
import SelectorEstudiantes from '../components/SelectorEstudiantes'
import ModuloNotas from '../components/ModuloNotas'
import estudiantesService from '../services/estudiantes'
import '../styles/NotasLayout.css'

const Notas = () => {
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null)
  const [estudianteId, setEstudianteId] = useState(null)

  useEffect(() => {
    try {
      const loggedUser = window.localStorage.getItem('loggedUser')
      if (loggedUser) {
        const userData = JSON.parse(loggedUser)
        setUsuarioActual(userData)
        if (userData.role === 'estudiante') {
          // Buscar el estudiante_id real
          estudiantesService.obtenerEstudiantes().then(estudiantes => {
            const est = estudiantes.find(e => e.user_id === userData.id)
            if (est) {
              // Tomar el nombre del usuario relacionado si existe
              const nombreEst = est.usuario?.nombre || est.nombre || est.name || '';
              const estudianteNormalizado = {
                ...est,
                nombre: nombreEst,
                id: est.id
              };
              setEstudianteSeleccionado(estudianteNormalizado)
              setEstudianteId(est.id)
            }
          })
        }
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error)
    }
  }, [])

  return (
    <div className="pagina-notas-flex">
      <div className="columna-izquierda">
          {(usuarioActual?.role === 'profesor' || usuarioActual?.role === 'admin') && (
            <SelectorEstudiantes
              onSeleccionEstudiante={setEstudianteSeleccionado}
              usuarioActual={usuarioActual}
            />
          )}
      </div>
      <div className="modulo-notas">
        {!estudianteSeleccionado ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: '350px',
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: '2.5rem 2rem',
              color: '#ef4444',
              fontSize: '1.35rem',
              fontWeight: '500',
              textAlign: 'center',
              maxWidth: '320px',
              margin: 'auto'
            }}>
              <span>Debes seleccionar un estudiante<br/>para ver las notas.</span>
            </div>
          </div>
        ) : (
          <ModuloNotas
            estudianteSeleccionado={usuarioActual?.role === 'estudiante' ? { ...estudianteSeleccionado, id: estudianteId } : estudianteSeleccionado}
            usuarioActual={usuarioActual}
          />
        )}
      </div>
    </div>
  )
}

export default Notas