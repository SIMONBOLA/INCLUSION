import { useState, useEffect } from 'react';
import InformeAnalitico from '../components/InformeAnalitico';
import SelectorEstudiantes from '../components/SelectorEstudiantes';
import { obtenerNotasPorEstudiante } from '../services/notas';
import estudiantesService from '../services/estudiantes';
import '../styles/AnaliticasPage.css';

const AnaliticasPage = () => {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [estudianteId, setEstudianteId] = useState(null);
  const [graficas, setGraficas] = useState([]);
  const [observacionesPorMateria, setObservacionesPorMateria] = useState({});
  const [profesor, setProfesor] = useState(null);
  const [informeGenerado, setInformeGenerado] = useState(null);

  useEffect(() => {
    const loggedUser = window.localStorage.getItem('loggedUser');
    if (loggedUser) {
      const user = JSON.parse(loggedUser);
      setUsuarioActual(user);
      setProfesor(user);
      // Solo seleccionar por defecto si es estudiante
      if (user.role === 'estudiante') {
        // Buscar el estudiante_id real
        estudiantesService.obtenerEstudiantes().then(estudiantes => {
          const est = estudiantes.find(e => e.user_id === user.id);
          if (est) {
            // Tomar el nombre del usuario relacionado si existe
            const nombreEst = est.usuario?.nombre || est.nombre || est.name || '';
            const estudianteNormalizado = {
              ...est,
              nombre: nombreEst,
              id: est.id
            };
            setEstudianteSeleccionado(estudianteNormalizado);
            setEstudianteId(est.id);
            cargarNotas(est.id);
          }
        });
      }
    }
  }, []);

  const cargarNotas = async (idEstudiante) => {
    try {
      const respuesta = await obtenerNotasPorEstudiante(idEstudiante);
      const notasArray = respuesta.notas || [];
      // Agrupar por materia y tomar la nota más reciente
      const notasPorMateria = {};
      notasArray.forEach(nota => {
        const materiaKey = nota.materia?.nombre || nota.nombreMateria || nota.materia_id;
        if (!notasPorMateria[materiaKey] || new Date(nota.fecha) > new Date(notasPorMateria[materiaKey].fecha)) {
          notasPorMateria[materiaKey] = nota;
        }
      });
      // Preparar datos para gráficas y observaciones
      const graficasData = Object.keys(notasPorMateria).map(materia => ({
        titulo: materia,
        materia,
        componente: <span>Nota: {notasPorMateria[materia].valor}</span>
      }));
      const observaciones = {};
      Object.keys(notasPorMateria).forEach(materia => {
        observaciones[materia] = notasPorMateria[materia].observaciones || '';
      });
      setGraficas(graficasData);
      setObservacionesPorMateria(observaciones);
    } catch (error) {
      setGraficas([]);
      setObservacionesPorMateria({});
    }
  };

  return (
    <div className="pagina-analiticas-flex">
      <div className="columna-izquierda">
          {usuarioActual?.role !== 'estudiante' && (
            <SelectorEstudiantes
              onSeleccionEstudiante={est => {
                // Tomar el nombre del usuario relacionado si existe
                const nombreEst = est.usuario?.nombre || est.nombre || est.name || '';
                const estudianteNormalizado = {
                  ...est,
                  nombre: nombreEst,
                  id: est.id
                };
                setEstudianteSeleccionado(estudianteNormalizado);
                cargarNotas(est.id);
              }}
              usuarioActual={usuarioActual}
            />
          )}
      </div>
      {/* Columna derecha: Informe analítico */}
      <div className="informe-analitico-container">
        {!estudianteSeleccionado ? (
          <div className="mensaje-seleccion-container">
            <div className="mensaje-seleccion">
              <span>Debes seleccionar un estudiante<br/>para ver el informe analítico.</span>
            </div>
          </div>
        ) : (
          <InformeAnalitico
            estudiante={estudianteSeleccionado}
            graficas={graficas}
            observacionesPorMateria={observacionesPorMateria}
            profesor={profesor}
            usuarioActual={usuarioActual}
            informeGenerado={informeGenerado}
            onInformeGenerado={setInformeGenerado}
          />
        )}
      </div>
    </div>
  );
};

export default AnaliticasPage;
