import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from '../services/axios';

const NotasChart = ({ estudianteId }) => {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!estudianteId) return;
    setLoading(true);
    axios.get(`/api/notas/${estudianteId}`)
      .then(res => {
        setNotas(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [estudianteId]);

  if (loading) return <div>Cargando notas...</div>;
  if (!notas.length) return <div>No hay notas registradas.</div>;

  const labels = notas.map(n => n.materia?.nombre || n.materia_id + '');
  const data = {
    labels,
    datasets: [
      {
        label: 'Nota',
        data: notas.map(n => n.valor),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <Bar data={data} options={{
        scales: {
          y: { beginAtZero: true, max: 5 }
        }
      }} />
    </div>
  );
};

export default NotasChart;
