import { useState, useEffect } from 'react'
import SelectorEstudiantes from '../components/SelectorEstudiantes'
import ModuloChat from '../components/ModuloChat'
import '../styles/layout.css'

const Comentarios = () => {
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null)

  useEffect(() => {
    const loggedUser = window.localStorage.getItem('loggedUser')
    if (loggedUser) {
      setUsuarioActual(JSON.parse(loggedUser))
    }
  }, [])

  return (
    <div className="pagina-chat">
      {usuarioActual?.role === 'profesor' && (
        <SelectorEstudiantes
          onSeleccionEstudiante={setEstudianteSeleccionado}
          usuarioActual={usuarioActual}
        />
      )}
      
      <ModuloChat
        estudianteSeleccionado={estudianteSeleccionado || usuarioActual || null}
        usuarioActual={usuarioActual || null}
      />
    </div>
  )
}

export default Comentarios