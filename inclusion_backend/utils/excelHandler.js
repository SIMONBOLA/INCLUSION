const xlsx = require('xlsx');
const bcrypt = require('bcrypt');
const { User, Estudiante, Materia, Nota } = require('../models');

const processExcelUsers = async (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const results = {
      success: [],
      errors: []
    };

    for (const row of data) {
      let transaction;
      try {
        transaction = await sequelize.transaction();
        // Validar campos requeridos
        if (!row.username || !row.password || !row.role) {
          results.errors.push({
            username: row.username || 'desconocido',
            error: 'Faltan campos requeridos (username, password, role)'
          });
          continue;
        }

        // Validar rol
        const validRoles = ['admin', 'profesor', 'estudiante'];
        if (!validRoles.includes(row.role.toLowerCase())) {
          results.errors.push({
            username: row.username,
            error: 'Rol inválido. Debe ser: admin, profesor o estudiante'
          });
          continue;
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(row.password, saltRounds);

        // Crear usuario
        const user = await User.create({
          username: row.username,
          nombre: row.nombre || '',
          apellido: row.apellido || '',
          email: row.email || '',
          passwordHash,
          role: row.role.toLowerCase(),
        }, { transaction });

        // Si es estudiante, crear el registro de estudiante y procesar notas si existen
        let estudiante;
        if (row.role.toLowerCase() === 'estudiante') {
          estudiante = await Estudiante.create({
            user_id: user.id,
            grupo: row.grupo || '',
            promedio: 0
          }, { transaction });

          // Procesar materias y notas si existen
          if (row.materias) {
            try {
              const materiasData = typeof row.materias === 'string' ? 
                JSON.parse(row.materias) : row.materias;

              for (const materiaData of materiasData) {
                if (!materiaData.nombre || !materiaData.calificacion) {
                  throw new Error('Datos de materia incompletos');
                }

                // Validar calificación
                const calificacion = parseFloat(materiaData.calificacion);
                if (isNaN(calificacion) || calificacion < 0 || calificacion > 5) {
                  throw new Error(`Calificación inválida para ${materiaData.nombre}: debe estar entre 0 y 5`);
                }

                // Buscar o crear la materia
                const [materia] = await Materia.findOrCreate({
                  where: { nombre: materiaData.nombre },
                  defaults: { nombre: materiaData.nombre },
                  transaction
                });

                // Crear la nota
                await Nota.create({
                  estudiante_id: estudiante.id,
                  materia_id: materia.id,
                  valor: calificacion,
                  observaciones: materiaData.observacion || '',
                  fecha: new Date(),
                  periodo: materiaData.periodo || 'actual'
                }, { transaction });
              }
            } catch (error) {
              throw new Error(`Error procesando materias: ${error.message}`);
            }
          }
        }

        await transaction.commit();

        results.success.push({
          username: user.username,
          role: user.role,
          grupo: estudiante?.grupo,
          materias: row.materias ? 
            (typeof row.materias === 'string' ? 
              JSON.parse(row.materias).length : row.materias.length) : 0
        });

      } catch (error) {
        if (transaction) await transaction.rollback();
        results.errors.push({
          username: row.username || 'desconocido',
          error: error.message
        });
      }
    }

    return results;
  } catch (error) {
    throw new Error('Error al procesar el archivo Excel: ' + error.message);
  }
};

module.exports = {
  processExcelUsers
};