import { useState, useEffect } from 'react'
import notasService from '../services/notas'
import '../styles/ModuloNotas.css'

const ModuloNotas = ({ estudianteSeleccionado, usuarioActual }) => {
  const [notas, setNotas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    const cargarNotas = async () => {
      if (estudianteSeleccionado) {
        try {
          setCargando(true)
          const notasEstudiante = await notasService.obtenerNotasEstudiante(estudianteSeleccionado.id)
          setNotas(notasEstudiante)
        } catch (error) {
          console.error('Error al cargar notas:', error)
          setMensaje({ tipo: 'error', texto: 'Error al cargar las notas' })
        } finally {
          setCargando(false)
        }
      }
    }

    cargarNotas()
  }, [estudianteSeleccionado])

  const handleGuardarNota = async (idMateria, nuevaNota) => {
    try {
      const datosActualizacion = {
        materiaId: idMateria,
        calificacion: nuevaNota,
        estudianteId: estudianteSeleccionado.id
      }

      await notasService.actualizarNota(estudianteSeleccionado.id, datosActualizacion)
      setMensaje({ tipo: 'exito', texto: 'Nota actualizada correctamente' })

      // Actualizar estado local
      setNotas(notas.map(nota =>
        nota.materiaId === idMateria
          ? { ...nota, calificacion: nuevaNota }
          : nota
      ))
    } catch (error) {
      console.error('Error al guardar nota:', error)
      setMensaje({ tipo: 'error', texto: 'Error al guardar la nota' })
    }
  }

  if (!estudianteSeleccionado) {
    return <div className="mensaje-seleccion">Seleccione un estudiante para ver sus notas</div>
  }

  if (cargando) {
    return <div className="cargando">Cargando notas...</div>
  }

  return (
    <div className="modulo-notas">
      <h2>Notas de {estudianteSeleccionado.name}</h2>
      
      {mensaje && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="tabla-notas">
        <table>
          <thead>
            <tr>
              <th>Materia</th>
              <th>Calificación</th>
              {usuarioActual?.role === 'profesor' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {notas.map((nota) => (
              <tr key={nota.materiaId}>
                <td>{nota.nombreMateria}</td>
                <td>
                  {usuarioActual?.role === 'profesor' ? (
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={nota.calificacion}
                      onChange={(e) => handleGuardarNota(nota.materiaId, e.target.value)}
                      className="input-nota"
                    />
                  ) : (
                    <span className="nota-valor">{nota.calificacion}</span>
                  )}
                </td>
                {usuarioActual?.role === 'profesor' && (
                  <td>
                    <button
                      className="btn-guardar"
                      onClick={() => handleGuardarNota(nota.materiaId, nota.calificacion)}
                    >
                      Guardar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ModuloNotas