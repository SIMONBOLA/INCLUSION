const express = require('express');
const InformeRouter = express.Router();
const Informe = require('../models/informe');

// Crear informe
InformeRouter.post('/', async (req, res) => {
  try {
    const { estudianteId, profesorId, materias, analisis } = req.body;
    const camposFaltantes = [];
    if (!estudianteId) camposFaltantes.push('estudianteId');
    if (!profesorId) camposFaltantes.push('profesorId');
    if (!materias || !Array.isArray(materias) || materias.length === 0) camposFaltantes.push('materias');
    if (!analisis || typeof analisis !== 'object') camposFaltantes.push('analisis');
    if (materias && Array.isArray(materias)) {
      materias.forEach(materia => {
        if (!analisis[materia] || analisis[materia].trim() === '') {
          camposFaltantes.push(`análisis de ${materia}`);
        }
      });
    }
    if (camposFaltantes.length > 0) {
      return res.status(400).json({ error: `Campos obligatorios faltantes: ${camposFaltantes.join(', ')}` });
    }
    const informe = await Informe.create({ estudianteId, profesorId, materias, analisis });
    res.status(201).json(informe);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el informe', details: error.message });
  }
});

// Eliminar informe por id
InformeRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const informe = await Informe.findByPk(id);
    if (!informe) return res.status(404).json({ error: 'Informe no encontrado' });
    await informe.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al borrar informe', details: error.message });
  }
});

// Obtener informes por estudiante
InformeRouter.get('/estudiante/:estudianteId', async (req, res) => {
  try {
    const { estudianteId } = req.params;
    const informes = await Informe.findAll({ where: { estudianteId }, order: [['fecha', 'DESC']] });
    res.json(informes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener informes', details: error.message });
  }
});

// Descargar informe PDF por id (debe ir antes que /:id)
const PDFDocument = require('pdfkit');
const { Nota, Materia } = require('../models');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
InformeRouter.get('/:id/descargar', async (req, res) => {
  let headersSent = false;
  try {
    const { id } = req.params;
    const informe = await Informe.findByPk(id);
    if (!informe) return res.status(404).json({ error: 'Informe no encontrado' });

    // Obtener notas por materia para el estudiante
    // Buscar nombres de estudiante y profesor
    const { User: UserModel, Estudiante: EstudianteModel } = require('../models');
    let nombreEstudiante = '';
    let nombreProfesor = '';
    // Buscar estudiante
    const estudianteObj = await EstudianteModel.findByPk(informe.estudianteId, { include: [{ model: UserModel, as: 'usuario' }] });
    if (estudianteObj && estudianteObj.usuario) {
      nombreEstudiante = estudianteObj.usuario.nombre || estudianteObj.usuario.name || `ID: ${informe.estudianteId}`;
    } else {
      nombreEstudiante = `ID: ${informe.estudianteId}`;
    }
    // Buscar profesor
    const profesorObj = await UserModel.findByPk(informe.profesorId);
    if (profesorObj) {
      nombreProfesor = profesorObj.nombre || profesorObj.name || `ID: ${informe.profesorId}`;
    } else {
      nombreProfesor = `ID: ${informe.profesorId}`;
    }

    let notasPorMateria = {};
    if (Array.isArray(informe.materias)) {
      // Buscar la nota más reciente de cada materia para el estudiante
      for (const matNombre of informe.materias) {
        // Buscar la materia por nombre
        const materiaObj = await Materia.findOne({ where: { nombre: matNombre } });
        if (materiaObj) {
          const nota = await Nota.findOne({
            where: { estudiante_id: informe.estudianteId, materia_id: materiaObj.id },
            order: [['fecha', 'DESC']]
          });
          notasPorMateria[matNombre] = nota ? nota.valor : 'Sin nota';
        } else {
          notasPorMateria[matNombre] = 'Sin nota';
        }
      }
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="informe_${id}.pdf"`);
    safePipePDF(doc, res);

    // Logo institucional
    try {
      doc.image(__dirname + '/../public/icit_logo.jpg', doc.page.width/2 - 60, 30, { width: 120 });
    } catch (e) {
      // Si no hay logo, continuar sin error
    }

    // Nombre del colegio debajo del logo (más abajo)
    doc.moveDown(7.5); // Aumenta el espacio para bajar el nombre
    doc.fontSize(18).font('Helvetica-Bold').text('INSTITUTO COMERCIAL INDUSTRIAL Y TECNOLÓGICO', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica-Bold').text('INFORME ACADÉMICO', { align: 'center', underline: true });
    doc.moveDown(1.5);

        // Datos generales
    doc.fontSize(12).font('Helvetica-Bold').text('Datos Generales:', { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12);
    doc.text(`ID Informe: ${informe.id}`);
    doc.text(`Estudiante: ${nombreEstudiante}`);
    doc.text(`Profesor: ${nombreProfesor}`);
    doc.text(`Fecha del informe: ${new Date(informe.fecha).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`);

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(1);


    // Materias y notas
    doc.font('Helvetica-Bold').fontSize(13).text('Materias:', { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12);
    let labels = [];
    let dataNotas = [];
    if (Array.isArray(informe.materias)) {
      informe.materias.forEach((mat, idx) => {
        const nota = notasPorMateria[mat] !== undefined ? notasPorMateria[mat] : 'Sin nota';
        doc.text(`• ${mat}  |  Nota: ${nota}`);
        if (nota !== 'Sin nota') {
          labels.push(mat);
          dataNotas.push(Number(nota));
        }
      });
    } else {
      doc.text('No registradas');
    }

    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(13).text('Análisis por Materia:', { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12);
    if (informe.analisis && typeof informe.analisis === 'object') {
      Object.entries(informe.analisis).forEach(([materia, analisis]) => {
        doc.font('Helvetica-Bold').text(materia + ':', { continued: true }).font('Helvetica').text(' ' + analisis);
        doc.moveDown(0.2);
      });
    } else {
      doc.text('No hay análisis registrado.');
    }

    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(1);

  // Gráfica de notas (solo barras)
    if (labels.length && dataNotas.length) {
      const width = 320;
      const height = 200;
      const chartCallback = (ChartJS) => {
        ChartJS.defaults.font.family = 'Arial';
      };
      const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback, backgroundColour: 'white' });
      const colorPalette = [
        '#4A90E2', '#50E3C2', '#F5A623', '#B8E986', '#D0021B', '#F8E71C', '#7ED321', '#417505', '#9013FE', '#8B572A'
      ];
      const backgroundColors = labels.map((_, i) => colorPalette[i % colorPalette.length] + 'CC');
      const borderColors = labels.map((_, i) => colorPalette[i % colorPalette.length]);

      // Gráfica de barras ÚNICA
      doc.fontSize(13).font('Helvetica-Bold').text('Gráfica de las Notas:', { underline: true });
      doc.moveDown(0.5);
      const barConfig = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Nota',
            data: dataNotas,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 2,
            barPercentage: 0.5,
            categoryPercentage: 0.6
          }]
        },
        options: {
          responsive: false,
          layout: { padding: 20 },
          plugins: {
            legend: { display: false },
            title: { display: false },
            datalabels: {
              anchor: 'center',
              align: 'center',
              color: '#000000ff',
              font: { weight: 'bold', size: 13 },
              formatter: function(value) { return value.toFixed(2); }
            }
          },
          scales: {
            x: {
              ticks: { font: { size: 12, weight: 'bold' }, color: '#333', padding: 8 },
              grid: { color: '#e0e0e0' }
            },
            y: {
              beginAtZero: true,
              max: 5,
              ticks: { stepSize: 0.5, font: { size: 12 }, color: '#333', padding: 8 },
              grid: { color: '#e0e0e0' }
            }
          }
        },
        plugins: [require('chartjs-plugin-datalabels')]
      };
      const barBuffer = await chartJSNodeCanvas.renderToBuffer(barConfig);
      // Verificar espacio antes de insertar la gráfica
      if (doc.y + height + 40 > doc.page.height) {
        doc.addPage();
        doc.moveDown(1);
      }
      doc.image(barBuffer, { fit: [width, height], align: 'center' });
      doc.moveDown(1);
    }

    // Pie de página institucional
    doc.fontSize(10).font('Helvetica-Oblique').fillColor('#888').text('INSTITUTO COMERCIAL INDUSTRIAL Y TECNOLÓGICO "I.C.I.T"', 50, doc.page.height - 70, { align: 'center' });
    doc.fontSize(9).text('Formación integral para la vida', { align: 'center' });
    doc.fontSize(8).text('Este informe es confidencial y solo para fines académicos.', { align: 'center' });
    doc.fillColor('black');

  doc.end();
  // No establecer headersSent aquí, solo cuando el stream realmente termina
  } catch (error) {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ error: 'Error al descargar informe', details: error.message });
    }
  }
});

// Obtener informes por profesor
InformeRouter.get('/profesor/:profesorId', async (req, res) => {
  try {
    const { profesorId } = req.params;
    const informes = await Informe.findAll({ where: { profesorId }, order: [['fecha', 'DESC']] });
    res.json(informes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener informes', details: error.message });
  }
});

// Obtener informe por id
InformeRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const informe = await Informe.findByPk(id);
    if (!informe) return res.status(404).json({ error: 'Informe no encontrado' });
    res.json(informe);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener informe', details: error.message });
  }
});

// Manejo robusto de errores en el stream del PDF para evitar ECONNRESET y doble respuesta
const safePipePDF = (doc, res) => {
  let finished = false;
  doc.on('error', err => {
    if (!finished && !res.headersSent) {
      finished = true;
      try { res.status(500).json({ error: 'Error al generar el PDF', details: err.message }); } catch {}
    }
  });
  res.on('close', () => { finished = true; });
  doc.pipe(res);
};

module.exports = InformeRouter;
