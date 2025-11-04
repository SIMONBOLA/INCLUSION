import { useState, useRef, useEffect } from 'react';
import NotasObservacionesMateria from './NotasObservacionesMateria';
// import html2pdf from 'html2pdf.js';
import '../styles/InformeAnalitico.css';

import informesService from '../services/informes';

const InformeAnalitico = ({ estudiante, graficas, observacionesPorMateria, profesor, usuarioActual, informeGenerado, onInformeGenerado }) => {
  // Estado local solo para mostrar cuál botón fue presionado (no afecta lógica)
  // Si es estudiante, iniciar siempre en 'ver', si es profesor en 'crear'
  const [botonActivo, setBotonActivo] = useState(usuarioActual?.role === 'estudiante' ? 'ver' : 'crear');

  // Efecto para resetear el formulario cuando cambia el estudiante
  useEffect(() => {
    if (resetForm) {
      resetForm();
    }
  }, [estudiante]);
  // Validar roles: solo admin y profesor pueden generar, estudiante solo puede ver y descargar
  const esAdminOProfesor = usuarioActual && ['admin', 'profesor'].includes(usuarioActual.role);
  const esEstudiante = usuarioActual && usuarioActual.role === 'estudiante';

  if (!usuarioActual) {
    return <div className="informe-analitico-container">No tienes permisos para ver el informe analítico.</div>;
  }
  if (!estudiante) {
    return (
      <div className="informe-analitico-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '350px'}}>
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
          <span>Debes seleccionar un estudiante<br/>para ver o crear el informe analítico.</span>
        </div>
      </div>
    );
  }

  const [analisis, setAnalisis] = useState({});
  const [error, setError] = useState(null);
  const errorTimeoutRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const mensajeTimeoutRef = useRef(null);
  const [informesEstudiante, setInformesEstudiante] = useState([]);
  // Cargar lista de informes por estudiante
  useEffect(() => {
    const cargarInformes = async () => {
      if (estudiante && estudiante.id) {
        try {
          const lista = await informesService.obtenerInformesPorEstudiante(estudiante.id);
          setInformesEstudiante(lista);
        } catch (err) {
          setInformesEstudiante([]);
        }
      } else {
        setInformesEstudiante([]);
      }
    };
    cargarInformes();
  }, [estudiante, informeGenerado]);

  const handleAnalisisChange = (materia, texto) => {
    setAnalisis(prev => ({ ...prev, [materia]: texto }));
  };

  // Validar campos requeridos para generar informe
  const validarCampos = () => {
    const camposFaltantes = [];
    if (!estudiante) camposFaltantes.push('estudiante');
    if (!profesor) camposFaltantes.push('profesor');
    if (!graficas.length) camposFaltantes.push('materias');
    graficas.forEach(grafica => {
      if (!analisis[grafica.materia] || analisis[grafica.materia].trim() === '') {
        camposFaltantes.push(`análisis de ${grafica.materia}`);
      }
    });
    if (camposFaltantes.length > 0) {
      return `Campos obligatorios faltantes: ${camposFaltantes.join(', ')}`;
    }
    return null;
  };

  // Reiniciar formulario
  const resetForm = () => {
    setAnalisis({});
    setError(null);
    setLoading(false);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current);
    if (onInformeGenerado) onInformeGenerado(null); // Esto reiniciará el estado informeGenerado
  };

  // Generar informe
  const handleGenerarInforme = async () => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setError(null);
    const errorCampos = validarCampos();
    if (errorCampos) {
      setError(errorCampos);
      errorTimeoutRef.current = setTimeout(() => setError(null), 3000);
      return;
    }
    setLoading(true);
    try {
      const data = {
        estudianteId: estudiante.id,
        profesorId: profesor.id,
        materias: graficas.map(g => g.materia),
        analisis,
      };
      const nuevoInforme = await informesService.crearInforme(data);
      if (onInformeGenerado) onInformeGenerado(nuevoInforme);
      setMensajeExito('¡Informe generado exitosamente!');
      if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current);
      mensajeTimeoutRef.current = setTimeout(() => {
        setMensajeExito(null);
        resetForm();
      }, 3000);
    } catch (err) {
      setError('Error al generar el informe: ' + (err.response?.data?.error || err.message));
      errorTimeoutRef.current = setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  const handleDescargar = async () => {
    if (informeGenerado && informeGenerado.id) {
      try {
        const blob = await informesService.descargarInforme(informeGenerado.id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Informe_${estudiante.nombre || estudiante.name}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        alert('Error al descargar el informe: ' + err.message);
      }
    } else {
      alert('No hay informe generado para descargar.');
    }
  };

  return (
    <div>
      <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center'}}>
        <button
          style={{background: botonActivo === 'ver' ? '#2563eb' : '#e5e7eb', color: botonActivo === 'ver' ? '#fff' : '#222', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', fontWeight: '600', cursor: 'pointer'}}
          onClick={() => setBotonActivo('ver')}
        >Ver informes</button>
        {/* Solo mostrar el botón de crear informe a profesores o administradores */}
        {esAdminOProfesor && (
          <button
            style={{background: botonActivo === 'crear' ? '#10b981' : '#e5e7eb', color: botonActivo === 'crear' ? '#fff' : '#222', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', fontWeight: '600', cursor: 'pointer'}}
            onClick={() => setBotonActivo('crear')}
          >Crear informe</button>
        )}
      </div>
      {/* Mensaje de éxito */}
      {mensajeExito && (
        <div className="mensaje-exito informe-analitico-exito">
          {mensajeExito}
        </div>
      )}
      {/* Mostrar solo la lista de informes si el botón activo es 'ver' */}
      {botonActivo === 'ver' ? (
        <div id="informe-lista">
          {informesEstudiante.length > 0 ? (
            <div style={{marginBottom: '1.5rem'}}>
              <h3 style={{marginBottom: '0.5rem'}}>Informes generados para este estudiante:</h3>
              <ul style={{listStyle: 'none', padding: 0}}>
                {informesEstudiante.map((inf) => (
                  <li key={inf.id} style={{marginBottom: '0.5rem', background: '#f3f4f6', borderRadius: '8px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <span>Fecha: {new Date(inf.fecha).toLocaleString()} | ID: {inf.id}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        style={{
                          background: '#10b981',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.3rem 0.8rem',
                          cursor: 'pointer'
                        }}
                        disabled={!informesEstudiante.some(i => i.id === inf.id)}
                        onClick={async () => {
                          if (!informesEstudiante.some(i => i.id === inf.id)) {
                            setError('Este informe ya no existe. Actualiza la lista.');
                            setTimeout(() => setError(null), 3000);
                            return;
                          }

                          try {
                            const blob = await informesService.descargarInforme(inf.id);
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `Informe_${estudiante.nombre || estudiante.name}_${inf.id}.pdf`;

                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);

                          } catch (err) {
                            setError('No se pudo descargar el informe. Puede que haya sido borrado.');
                            setTimeout(() => setError(null), 3000);
                          }
                        }}
                      >
                        Descargar PDF
                      </button>
                    </div>
                    {esAdminOProfesor && (
                      <button 
                        style={{marginLeft: '0.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer'}} 
                        onClick={async () => {
                          if (!window.confirm('¿Seguro que deseas borrar este informe?')) return;
                          try {
                            await informesService.eliminarInforme(inf.id);
                            setInformesEstudiante(prev => prev.filter(i => i.id !== inf.id));
                            setMensajeExito('¡Informe borrado exitosamente!');
                            if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current);
                            mensajeTimeoutRef.current = setTimeout(() => setMensajeExito(null), 3000);
                          } catch (err) {
                            alert('Error al borrar el informe: ' + (err.response?.data?.error || err.message));
                          }
                        }}
                      >Borrar</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{marginBottom: '1.5rem', textAlign: 'center', color: '#666'}}>No hay informes generados para este estudiante.</div>
          )}
        </div>
      ) : (
        <div>
          <h2>Informe Analítico de {estudiante.nombre || estudiante.name}</h2>
          <p><strong>Profesor:</strong> {profesor?.nombre || profesor?.name}</p>
          {graficas.map((grafica, idx) => (
            <div key={idx} className="grafica-analitica">
              <h3>{grafica.titulo}</h3>
              <div>{grafica.componente}</div>
              <div className="observaciones-materia">
                <NotasObservacionesMateria estudianteId={estudiante.id} materiaNombre={grafica.materia} />
              </div>
              {esAdminOProfesor && (
                <div className="analisis-profesor">
                  <strong>Análisis del profesor:</strong>
                  <textarea
                    value={analisis[grafica.materia] || ''}
                    onChange={e => handleAnalisisChange(grafica.materia, e.target.value)}
                    placeholder="Escribe aquí tu análisis..."
                  />
                </div>
              )}
              {esEstudiante && analisis[grafica.materia] && (
                <div className="analisis-profesor">
                  <strong>Análisis del profesor:</strong>
                  <div style={{background: '#f3f4f6', padding: '0.5rem', borderRadius: '6px'}}>{analisis[grafica.materia]}</div>
                </div>
              )}
            </div>
          ))}
          {/* Mostrar error si existe */}
          {error && <div style={{color: 'red', margin: '1rem 0', textAlign: 'center'}}>{error}</div>}
          {/* Botón para generar informe solo para admin/profesor si no está generado */}
          {esAdminOProfesor && !informeGenerado && (
            <button
              className="btn-descargar"
              style={{background: '#10b981'}}
              onClick={handleGenerarInforme}
              disabled={loading}
            >
              {loading ? 'Generando...' : 'Generar informe'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default InformeAnalitico;
