import { useState, useRef, useEffect } from 'react'
import { obtenerNotasPorEstudiante, crearNota, eliminarNota, obtenerMaterias } from '../services/notas'
import notasService from '../services/notas'
import '../styles/ModuloNotas.css'

const ModuloNotas = ({ estudianteSeleccionado, usuarioActual, onNotaActualizada }) => {
  const [notas, setNotas] = useState([])
  const [promedio, setPromedio] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState(null)
  const [materias, setMaterias] = useState([])
  const mensajeTimeoutRef = useRef(null)
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false)
  const [nuevaNota, setNuevaNota] = useState({
    nombreMateria: '',
    valor: '',
    observaciones: ''
  })

  const TIEMPO_MENSAJE = 4000; // 4 segundos para todos los mensajes

  const mostrarMensajeTemporal = (tipo, texto) => {
    // Limpiar cualquier timeout existente
    if (mensajeTimeoutRef.current) {
      clearTimeout(mensajeTimeoutRef.current);
      setMensaje(null);
    }

    // Mostrar el mensaje
    setMensaje({ tipo, texto });
    
    // Configurar el timeout para ocultar el mensaje
    mensajeTimeoutRef.current = setTimeout(() => {
      setMensaje(null);
      mensajeTimeoutRef.current = null;
    }, TIEMPO_MENSAJE);
  };

  // Limpiar el timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (mensajeTimeoutRef.current) {
        clearTimeout(mensajeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const cargarDatos = async () => {
      if (estudianteSeleccionado) {
        try {
          setCargando(true)
          console.log('Cargando notas para estudiante:', estudianteSeleccionado)
          
          // Obtener notas y promedio
          const respuestaNotas = await obtenerNotasPorEstudiante(estudianteSeleccionado.id);
          console.log('Respuesta de notas recibida:', respuestaNotas)
          
          // Obtener materias disponibles
          const materiasDisponibles = await obtenerMaterias();
          console.log('Materias disponibles:', materiasDisponibles)
          
          // Procesar y normalizar las notas
          const notasEstudiante = respuestaNotas.notas.map(nota => ({
            ...nota,
            valor: parseFloat(nota.valor || nota.calificacion || 0).toFixed(2),
            calificacion: parseFloat(nota.valor || nota.calificacion || 0).toFixed(2)
          }));
          
          // Actualizar el estado con los datos normalizados
          setNotas(notasEstudiante);
          setPromedio(respuestaNotas.promedio);
          setMaterias(materiasDisponibles);
          
          // Notificar al componente padre si es necesario
          if (onNotaActualizada) {
            onNotaActualizada();
          }
        } catch (error) {
          console.error('Error al cargar datos:', error);
          mostrarMensajeTemporal('error', 'Error al cargar las notas y materias');
        } finally {
          setCargando(false);
        }
      }
    };
    cargarDatos();
  }, [estudianteSeleccionado, usuarioActual]);

  const handleGuardarNota = async (idMateria, nuevaNota) => {
    if (!estudianteSeleccionado?.id) {
      mostrarMensajeTemporal('error', 'No se ha seleccionado un estudiante válido');
      return;
    }

    // Validar que la nota sea un número válido entre 0 y 10
    const valorNumerico = parseFloat(nuevaNota);
    if (isNaN(valorNumerico) || valorNumerico < 0 || valorNumerico > 10) {
      mostrarMensajeTemporal('error', 'La nota debe ser un número entre 0 y 10');
      return;
    }

    try {
      // Buscar la nota existente
      const notaAEditar = notas.find(nota => (nota.materia?.id || nota.materiaId) === idMateria);
      if (!notaAEditar) {
        mostrarMensajeTemporal('error', 'No se encontró la nota a editar');
        return;
      }

      // Preparar datos de actualización
      const datosActualizacion = {
        valor: valorNumerico.toFixed(2),
        observaciones: notaAEditar.observaciones || '',
        fecha: new Date().toISOString(),
        periodo: notaAEditar.periodo || '2023-2'
      };
      const respuesta = await notasService.actualizarNota(notaAEditar.id, datosActualizacion);
      mostrarMensajeTemporal('exito', 'Nota actualizada correctamente');
      
      // Actualizar las notas localmente
      const notaActualizada = { ...notaAEditar, valor: nuevaNota };
      const notasActualizadas = notas.map(nota =>
        nota.id === notaAEditar.id ? notaActualizada : nota
      );
      setNotas(notasActualizadas);
      
      // Actualizar el promedio del backend
      if (respuesta.promedio !== undefined) {
        const nuevoPromedio = respuesta.promedio;
        setPromedio(nuevoPromedio);
        // Actualizar el promedio en el estudiante seleccionado
        if (estudianteSeleccionado) {
          estudianteSeleccionado.promedio = nuevoPromedio;
          if (typeof onNotaActualizada === 'function') {
            onNotaActualizada();
          }
        }
      }
      
      // Actualizar el estudiante en la lista con el nuevo promedio
      if (estudianteSeleccionado) {
        estudianteSeleccionado.promedio = nuevoPromedio;
        
        // Forzar actualización en el componente padre
        if (typeof onNotaActualizada === 'function') {
          onNotaActualizada();
        }
      }
    } catch (error) {
      console.error('Error al guardar nota:', error);
      // Mostrar el mensaje de error específico del backend
      mostrarMensajeTemporal('error', error.message || 'Error al guardar la nota');
    }
  }

  if (!estudianteSeleccionado) {
    return <div className="mensaje-seleccion">Seleccione un estudiante para ver sus notas</div>
  }

  if (cargando) {
    return <div className="cargando">Cargando notas...</div>
  }

  // Agrupar por materia y mostrar solo la nota más reciente por materia
  const notasPorMateria = {};
  const notasArray = Array.isArray(notas) ? notas : [];
  notasArray.forEach(nota => {
    const materiaKey = nota.materia?.nombre || nota.nombreMateria || nota.materia_id;
    if (!notasPorMateria[materiaKey] || new Date(nota.fecha) > new Date(notasPorMateria[materiaKey].fecha)) {
      notasPorMateria[materiaKey] = nota;
    }
  });
  const notasUnicas = Object.values(notasPorMateria);

  return (
    <div>
      <div className="encabezado-notas">
        <h2>Notas de {estudianteSeleccionado.nombre || estudianteSeleccionado.name} <span style={{fontSize: '1rem', color: '#888', fontWeight: 400}}>(ID: {estudianteSeleccionado.id})</span></h2>
        <div className="promedio-container">
          <span className="promedio-label">Promedio:</span>
          <span className="promedio-valor">{
            typeof promedio === 'number' && !isNaN(promedio)
              ? Number(promedio).toFixed(2)
              : typeof promedio === 'string' ? Number(promedio).toFixed(2) : '0.00'
          }</span>
        </div>
      </div>
      {(usuarioActual?.role === 'profesor' || usuarioActual?.role === 'admin') && (
        <div>
          <button className="btn-agregar-materia" onClick={() => setMostrarModalAgregar(true)}>
            Agregar materia
          </button>
          
          {mostrarModalAgregar && (
            <div className="modal-agregar">
              <div className="modal-content">
                <h3>Agregar Nueva Nota</h3>
                <input
                  type="text"
                  value={nuevaNota.nombreMateria || ''}
                  onChange={(e) => setNuevaNota({...nuevaNota, nombreMateria: e.target.value})}
                  placeholder="Nombre de la materia"
                  className="input-materia"
                />
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={nuevaNota.valor}
                  onChange={(e) => setNuevaNota({...nuevaNota, valor: e.target.value})}
                  placeholder="Calificación"
                />
                <textarea
                  value={nuevaNota.observaciones}
                  onChange={(e) => setNuevaNota({...nuevaNota, observaciones: e.target.value})}
                  placeholder="Observaciones"
                />
                <div className="modal-buttons">
                  <button onClick={async () => {
                    try {
                      if (!nuevaNota.nombreMateria) {
                        mostrarMensajeTemporal('error', 'El nombre de la materia es obligatorio');
                        return;
                      }
                      const valorNumerico = parseFloat(nuevaNota.valor);
                      if (isNaN(valorNumerico) || valorNumerico < 0 || valorNumerico > 10) {
                        mostrarMensajeTemporal('error', 'La nota debe ser un número entre 0 y 10');
                        return;
                      }
                      await crearNota(estudianteSeleccionado.id, nuevaNota);
                      const respuesta = await obtenerNotasPorEstudiante(estudianteSeleccionado.id);
                      setNotas(respuesta.notas || []);
                      setPromedio(respuesta.promedio || 0);
                      setMostrarModalAgregar(false);
                      setNuevaNota({ nombreMateria: '', valor: '', observaciones: '' });
                      mostrarMensajeTemporal('exito', 'Nota agregada correctamente');
                    } catch (error) {
                      mostrarMensajeTemporal('error', 'Error al agregar la nota');
                    }
                  }}>Guardar</button>
                  <button onClick={() => setMostrarModalAgregar(false)}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
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
              <th>Observaciones</th>
              {(usuarioActual?.role === 'profesor' || usuarioActual?.role === 'admin') && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {notasUnicas.map((nota) => (
              <tr key={nota.id || nota.materiaId}>
                <td style={{color: '#000', fontWeight: 'bold'}}>{nota.materia?.nombre || nota.nombreMateria}</td>
                <td>
                  {(usuarioActual?.role === 'profesor' || usuarioActual?.role === 'admin') ? (
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={nota.valor || nota.calificacion}
                      onChange={(e) => {
                        const notaActualizada = { ...nota, valor: e.target.value };
                        setNotas(notas.map(n => n.id === nota.id ? notaActualizada : n));
                      }}
                      className="input-nota"
                    />
                  ) : (
                    <span className="nota-valor">{nota.valor || nota.calificacion}</span>
                  )}
                </td>
                <td>
                  {(usuarioActual?.role === 'profesor' || usuarioActual?.role === 'admin') ? (
                    <textarea
                      value={nota.observaciones || ''}
                      onChange={(e) => {
                        const notaActualizada = { ...nota, observaciones: e.target.value };
                        setNotas(notas.map(n => n.id === nota.id ? notaActualizada : n));
                      }}
                      placeholder="Agregar observaciones..."
                      className="input-observaciones"
                    />
                  ) : (
                    <span className="nota-observaciones">{nota.observaciones || 'Sin observaciones'}</span>
                  )}
                </td>
                {(usuarioActual?.role === 'profesor' || usuarioActual?.role === 'admin') && (
                  <td style={{display: 'flex', gap: '0.5rem'}}>
                    <button
                      className="btn-guardar"
                      onClick={async () => {
                        const valorNumerico = parseFloat(nota.valor);
                        if (isNaN(valorNumerico) || valorNumerico < 0 || valorNumerico > 5) {
                          return;
                        }
                        try {
                          // Actualizar los datos de la nota existente
                          const respuesta = await notasService.actualizarNota(nota.id, {
                            valor: nota.valor,
                            observaciones: nota.observaciones,
                            fecha: new Date().toISOString(),
                            periodo: nota.periodo || 'actual'
                          });
                          // Actualizar el estado local solo para la nota editada
                          setNotas(notas.map(n => n.id === nota.id ? { ...n, valor: nota.valor, observaciones: nota.observaciones } : n));
                          // Actualizar el promedio si viene en la respuesta
                          if (respuesta.promedio !== undefined) {
                            const nuevoPromedio = parseFloat(respuesta.promedio);
                            setPromedio(nuevoPromedio);
                            // También actualizar el promedio en el estudiante seleccionado
                            if (estudianteSeleccionado) {
                              estudianteSeleccionado.promedio = nuevoPromedio;
                            }
                          }
                          mostrarMensajeTemporal('exito', 'Nota actualizada correctamente');
                        } catch (error) {
                          console.error('Error al actualizar los datos:', error);
                        }
                      }}
                    >
                      Guardar
                    </button>
                    <button
                      className="btn-borrar"
                      style={{background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem'}}
                      onClick={async () => {
                        if (window.confirm('¿Está seguro de que desea eliminar esta nota?')) {
                          try {
                            await eliminarNota(nota.id);
                            const notasActualizadas = await obtenerNotasPorEstudiante(estudianteSeleccionado.id);
                            setNotas(notasActualizadas.notas || []);
                            mostrarMensajeTemporal();
                            mostrarMensajeTemporal('exito', 'Materia borrada exitosamente');
                          } catch (error) {
                            mostrarMensajeTemporal('error', 'Error al eliminar la materia');
                            console.error('Error al eliminar la nota:', error);
                          }
                        }
                      }}
                    >
                      Borrar
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