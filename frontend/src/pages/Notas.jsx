import { useState, useEffect } from 'react'
import SelectorEstudiantes from '../components/SelectorEstudiantes'
import ModuloNotas from '../components/ModuloNotas'

const Notas = () => {
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null)

  useEffect(() => {
    try {
      const loggedUser = window.localStorage.getItem('loggedUser')
      if (loggedUser) {
        const userData = JSON.parse(loggedUser)
        setUsuarioActual(userData)
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error)
    }
  }, [])

  return (
    <div className="pagina-notas">
      {usuarioActual?.role === 'profesor' && (
        <SelectorEstudiantes
          onSeleccionEstudiante={setEstudianteSeleccionado}
          usuarioActual={usuarioActual}
        />
      )}
      
      <ModuloNotas
        estudianteSeleccionado={estudianteSeleccionado || usuarioActual}
        usuarioActual={usuarioActual}
      />
    </div>
  )
}

export default Notas