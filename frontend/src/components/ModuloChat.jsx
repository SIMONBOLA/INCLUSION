import { useState, useEffect, useRef } from 'react'
import mensajesService from '../services/mensajes'
import '../styles/ModuloChat.css'

const ModuloChat = ({ estudianteSeleccionado, usuarioActual }) => {
  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const chatRef = useRef(null)

  useEffect(() => {
    const cargarMensajes = async () => {
      // Validar que tengamos tanto el estudiante como el usuario actual
      if (!estudianteSeleccionado?.id || !usuarioActual?.id) {
        return
      }

      try {
        setCargando(true)
        setError(null)
        const mensajesChat = await mensajesService.getMensajes(estudianteSeleccionado.id)
        setMensajes(Array.isArray(mensajesChat) ? mensajesChat : [])
      } catch (error) {
        console.error('Error al cargar mensajes:', error)
        setError('No se pudieron cargar los mensajes')
        setMensajes([])
      } finally {
        setCargando(false)
      }
    }

    cargarMensajes()
  }, [estudianteSeleccionado, usuarioActual])

  useEffect(() => {
    // Scroll al último mensaje cuando se actualicen los mensajes
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [mensajes])

  const enviarMensaje = async (e) => {
    e.preventDefault()
    if (!nuevoMensaje.trim() || !estudianteSeleccionado?.id || !usuarioActual?.id) return

    const mensaje = {
      contenido: nuevoMensaje,
      emisorId: usuarioActual.id,
      receptorId: estudianteSeleccionado.id,
      timestamp: new Date().toISOString()
    }

    try {
      setError(null)
      const mensajeEnviado = await mensajesService.enviarMensaje(mensaje)
      setMensajes(mensajes => [...mensajes, mensajeEnviado])
      setNuevoMensaje('')
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      setError('No se pudo enviar el mensaje')
    }
  }

  const formatearHora = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Si no hay estudiante seleccionado, mostrar mensaje de selección
  if (!estudianteSeleccionado?.id) {
    return (
      <div className="modulo-chat">
        <div className="mensaje-seleccion">
          <i className="fas fa-user-plus"></i>
          <p>Seleccione un estudiante para comenzar el chat</p>
        </div>
      </div>
    )
  }

  // Si está cargando, mostrar spinner
  if (cargando) {
    return (
      <div className="modulo-chat">
        <div className="cargando">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando mensajes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="modulo-chat">
      <div className="chat-header">
        <div className="chat-usuario">
          <div className="avatar">
            {estudianteSeleccionado.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="info-usuario">
            <span className="nombre">{estudianteSeleccionado.name || 'Usuario'}</span>
            <span className="estado">En línea</span>
          </div>
        </div>
      </div>

      <div className="chat-mensajes" ref={chatRef}>
        {error && (
          <div className="error-mensaje">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
          </div>
        )}
        
        {!error && mensajes.length === 0 && (
          <div className="sin-mensajes">
            <i className="fas fa-comments"></i>
            <p>No hay mensajes aún. ¡Inicia la conversación!</p>
          </div>
        )}
        
        {!error && mensajes.length > 0 && mensajes.map((mensaje, index) => (
          <div
            key={index}
            className={`mensaje ${mensaje.emisorId === usuarioActual.id ? 'enviado' : 'recibido'}`}
          >
            <div className="contenido-mensaje">
              {mensaje.contenido}
              <span className="hora">{formatearHora(mensaje.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>

      <form className="chat-input" onSubmit={enviarMensaje}>
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          disabled={!!error || !estudianteSeleccionado?.id}
        />
        <button 
          type="submit" 
          disabled={!nuevoMensaje.trim() || !!error || !estudianteSeleccionado?.id}
        >
          {cargando ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <>
              <i className="fas fa-paper-plane"></i>
              <span>Enviar</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default ModuloChat