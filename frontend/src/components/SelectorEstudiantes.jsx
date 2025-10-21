import { useState, useEffect } from 'react'
import '../styles/SelectorEstudiantes.css'
import estudiantesService from '../services/estudiantes'

const SelectorEstudiantes = ({ onSeleccionEstudiante, usuarioActual }) => {
  const [estudiantes, setEstudiantes] = useState([])
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const obtenerEstudiantes = async () => {
      try {
        setCargando(true)
        const listaEstudiantes = await estudiantesService.obtenerEstudiantes()
        setEstudiantes(listaEstudiantes)
      } catch (error) {
        console.error('Error al obtener estudiantes:', error)
      } finally {
        setCargando(false)
      }
    }

    if (usuarioActual?.role === 'profesor') {
      obtenerEstudiantes()
    }
  }, [usuarioActual])

  // Filtrar estudiantes según término de búsqueda
  const estudiantesFiltrados = estudiantes?.filter(estudiante =>
    estudiante?.name?.toLowerCase().includes(terminoBusqueda?.toLowerCase() || '')
  ) || []

  return usuarioActual?.role === 'profesor' ? (
    <div className="selector-estudiantes">
      <div className="contenedor-selector">
        <input
          type="text"
          placeholder="Buscar estudiante..."
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          className="buscador-estudiantes"
        />
        {cargando ? (
          <div className="indicador-carga">Cargando estudiantes...</div>
        ) : (
          <div className="lista-estudiantes">
            {estudiantesFiltrados.map((estudiante) => (
              <div
                key={estudiante.id}
                className="item-estudiante"
                onClick={() => onSeleccionEstudiante(estudiante)}
              >
                <div className="avatar-estudiante">
                  {estudiante.name.charAt(0).toUpperCase()}
                </div>
                <div className="info-estudiante">
                  <span className="nombre-estudiante">{estudiante.name}</span>
                  <span className="email-estudiante">{estudiante.email}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  ) : null
}

export default SelectorEstudiantes