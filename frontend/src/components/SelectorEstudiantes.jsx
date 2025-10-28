import { useState, useEffect } from 'react'
import '../styles/SelectorEstudiantes.css'
import estudiantesService from '../services/estudiantes'

const SelectorEstudiantes = ({ onSeleccionEstudiante, usuarioActual }) => {
  const [estudiantes, setEstudiantes] = useState([])
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState('todos')
  const [ordenarPor, setOrdenarPor] = useState('nombre')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const obtenerEstudiantes = async () => {
      try {
        setCargando(true)
        const data = await estudiantesService.obtenerEstudiantes()
        setEstudiantes(data || [])
      } catch (error) {
        console.error('Error al obtener estudiantes:', error)
        // Los datos mock ya están incluidos en el servicio como fallback
      } finally {
        setCargando(false)
      }
    }

    obtenerEstudiantes()
  }, [])

  const grupos = ['todos', ...new Set(estudiantes.map(e => e.grupo))].sort()

  // Filtrar y ordenar estudiantes
  const estudiantesFiltrados = estudiantes
    .filter(estudiante => 
      (filtroGrupo === 'todos' || estudiante.grupo === filtroGrupo) &&
      (estudiante.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
       estudiante.username.toLowerCase().includes(terminoBusqueda.toLowerCase()))
    )
    .sort((a, b) => {
      switch (ordenarPor) {
        case 'promedio':
          return b.promedio - a.promedio
        case 'grupo':
          return a.grupo.localeCompare(b.grupo)
        default:
          return a.nombre.localeCompare(b.nombre)
      }
    })

  return (
    <div className="selector-estudiantes">
      <div className="contenedor-selector">
        <div className="filtros-container">
          <input
            type="text"
            placeholder="Buscar por nombre o usuario..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            className="buscador-estudiantes"
          />
          <div className="filtros-secundarios">
            <select 
              value={filtroGrupo} 
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className="selector-grupo"
            >
              {grupos.map(grupo => (
                <option key={grupo} value={grupo}>
                  {grupo === 'todos' ? 'Todos los grupos' : `Grupo ${grupo}`}
                </option>
              ))}
            </select>
            <select 
              value={ordenarPor} 
              onChange={(e) => setOrdenarPor(e.target.value)}
              className="selector-orden"
            >
              <option value="nombre">Ordenar por nombre</option>
              <option value="promedio">Ordenar por promedio</option>
              <option value="grupo">Ordenar por grupo</option>
            </select>
          </div>
        </div>

        {cargando ? (
          <div className="indicador-carga">
            <div className="spinner"></div>
            <span>Cargando estudiantes...</span>
          </div>
        ) : estudiantesFiltrados.length > 0 ? (
          <div className="lista-estudiantes">
            {estudiantesFiltrados.map((estudiante) => (
              <div
                key={estudiante.id}
                className="item-estudiante"
                onClick={() => onSeleccionEstudiante(estudiante)}
              >
                <div className={`avatar-estudiante ${estudiante.is_online ? 'online' : ''}`}>
                  {estudiante.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="info-estudiante">
                  <div className="info-principal">
                    <span className="nombre-estudiante">{estudiante.nombre}</span>
                    <span className="username-estudiante">@{estudiante.username}</span>
                  </div>
                  <div className="info-secundaria">
                    <span className="grupo-estudiante">Grupo {estudiante.grupo}</span>
                    <span className="promedio-estudiante">Promedio: {estudiante.promedio}</span>
                    {estudiante.is_online && (
                      <span className="estado-online">En línea</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-resultados">
            <i className="fas fa-search"></i>
            <p>No se encontraron estudiantes</p>
            <span>Intenta con otros criterios de búsqueda</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default SelectorEstudiantes