import { useState, useEffect, useRef } from 'react'
import '../styles/ModuloChat.css'

const ModuloChat = ({ estudianteSeleccionado, usuarioActual }) => {
  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [cargando, setCargando] = useState(true)
  const chatRef = useRef(null)

  useEffect(() => {
    const cargarMensajes = async () => {
      if (estudianteSeleccionado && usuarioActual) {
        try {
          setCargando(true)
          // Aquí implementarías la lógica para cargar mensajes desde el backend
          const respuesta = await fetch(`/api/mensajes/${estudianteSeleccionado.id}`)
          const mensajesChat = await respuesta.json()
          setMensajes(mensajesChat)
        } catch (error) {
          console.error('Error al cargar mensajes:', error)
        } finally {
          setCargando(false)
        }
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
    if (!nuevoMensaje.trim()) return

    const mensaje = {
      contenido: nuevoMensaje,
      emisorId: usuarioActual.id,
      receptorId: estudianteSeleccionado.id,
      timestamp: new Date().toISOString()
    }

    try {
      // Aquí implementarías la lógica para enviar el mensaje al backend
      await fetch('/api/mensajes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mensaje)
      })

      setMensajes([...mensajes, mensaje])
      setNuevoMensaje('')
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
    }
  }

  const formatearHora = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!estudianteSeleccionado) {
    return <div className="mensaje-seleccion">Seleccione un estudiante para comenzar el chat</div>
  }

  if (cargando) {
    return <div className="cargando">Cargando mensajes...</div>
  }

  return (
    <div className="modulo-chat">
      <div className="chat-header">
        <div className="chat-usuario">
          <div className="avatar">
            {estudianteSeleccionado.name.charAt(0).toUpperCase()}
          </div>
          <div className="info-usuario">
            <span className="nombre">{estudianteSeleccionado.name}</span>
            <span className="estado">En línea</span>
          </div>
        </div>
      </div>

      <div className="chat-mensajes" ref={chatRef}>
        {mensajes.map((mensaje, index) => (
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
        />
        <button type="submit" disabled={!nuevoMensaje.trim()}>
          Enviar
        </button>
      </form>
    </div>
  )
}

export default ModuloChat