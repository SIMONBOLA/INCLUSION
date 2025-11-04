import React, { useEffect, useState } from 'react';
import { obtenerNotasPorEstudiante } from '../services/notas';

// Muestra las notas y observaciones de una materia específica para un estudiante
const NotasObservacionesMateria = ({ estudianteId, materiaNombre }) => {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!estudianteId || !materiaNombre) return;
    setLoading(true);
    obtenerNotasPorEstudiante(estudianteId)
      .then(res => {
        // Filtrar solo las notas de la materia
        const notasMateria = (res.notas || []).filter(n => (n.materia?.nombre || n.materia_id + '') === materiaNombre);
        setNotas(notasMateria);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [estudianteId, materiaNombre]);

  if (loading) return <div>Cargando notas y observaciones...</div>;
  if (!notas.length) return <div>No hay notas ni observaciones para esta materia.</div>;

  return (
    <div style={{ margin: '1rem 0' }}>
      <h4>Notas y observaciones de {materiaNombre}:</h4>
      <ul style={{ paddingLeft: 20 }}>
        {notas.map((nota, idx) => (
          <li key={idx} style={{ marginBottom: 8 }}>
            <strong>Nota:</strong> {nota.valor} {nota.fecha && <span style={{ color: '#888', fontSize: 12 }}>({new Date(nota.fecha).toLocaleDateString()})</span>}<br />
            <strong>Observación:</strong> {nota.observaciones || 'Sin observaciones'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotasObservacionesMateria;
