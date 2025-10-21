import { useState, useEffect } from 'react'
import SelectorEstudiantes from '../components/SelectorEstudiantes'
import ModuloGraficas from '../components/ModuloGraficas'

const Graficas = () => {
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null)

  useEffect(() => {
    const loggedUser = window.localStorage.getItem('loggedUser')
    if (loggedUser) {
      setUsuarioActual(JSON.parse(loggedUser))
    }
  }, [])

  return (
    <div className="pagina-graficas">
      {usuarioActual?.role === 'profesor' && (
        <SelectorEstudiantes
          onSeleccionEstudiante={setEstudianteSeleccionado}
          usuarioActual={usuarioActual}
        />
      )}
      
      <ModuloGraficas
        estudianteSeleccionado={estudianteSeleccionado || usuarioActual}
        usuarioActual={usuarioActual}
      />
    </div>
  )
}

export default Graficas