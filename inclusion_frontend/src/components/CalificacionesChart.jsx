import React, { useEffect, useState } from 'react';
import { obtenerNotasPorEstudiante } from '../services/notas';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const CalificacionesChart = ({ estudianteId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!estudianteId) return;
    obtenerNotasPorEstudiante(estudianteId).then((respuesta) => {
      const notas = respuesta.notas || [];
      setData(notas.map((n) => ({
        materia: n.materia?.nombre || n.materia_id,
        nota: Number(n.valor)
      })));
    });
  }, [estudianteId]);

  return (
    <BarChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="materia" />
      <YAxis domain={[0, 5]} />
      <Tooltip />
      <Bar dataKey="nota" fill="#8884d8" />
    </BarChart>
  );
};

export default CalificacionesChart;
