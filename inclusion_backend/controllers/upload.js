const express = require('express');
const multer = require('multer');
const { sequelize } = require('../models/user');
const { User, Estudiante } = require('../models');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs').promises;
const xlsx = require('xlsx');

const uploadRouter = express.Router();

// Configuración de multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `users-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

uploadRouter.post('/upload', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    let transaction;
    
    try {
      if (err) {
        console.error('Error de multer:', err);
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
      }

      // Iniciar transacción
      transaction = await sequelize.transaction();

      console.log('Procesando archivo:', req.file.originalname);

      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      const results = {
        success: [],
        errors: []
      };

      for (const row of data) {
        try {
          // Validaciones básicas
          if (!row.username || !row.password || !row.role) {
            throw new Error('Faltan campos requeridos (username, password, role)');
          }

          const role = row.role.toLowerCase();
          if (!['admin', 'profesor', 'estudiante'].includes(role)) {
            throw new Error('Rol inválido. Debe ser: admin, profesor o estudiante');
          }

          if (role === 'estudiante' && !row.grupo) {
            throw new Error('Los estudiantes requieren un grupo asignado');
          }

          // Generar hash de contraseña
          const password_hash = await bcrypt.hash(row.password, 10);

          // Crear el usuario con los campos exactos del modelo
          const userData = {
            username: row.username,
            password_hash,
            nombre: row.nombre || '',
            role: role
          };

          console.log('Creando usuario:', { ...userData, password_hash: '[PROTECTED]' });

          const user = await User.create(userData, { transaction });

          // Si es estudiante, crear el registro correspondiente
          if (role === 'estudiante') {
            const estudiante = await Estudiante.create({
              user_id: user.id,
              grupo: row.grupo,
              promedio: 0
            }, { transaction });

            // Procesar materias si existen
            if (row.materias) {
              try {
                const materias = typeof row.materias === 'string' ? 
                  JSON.parse(row.materias) : row.materias;

                if (Array.isArray(materias)) {
                  for (const materiaData of materias) {
                    // Primero buscar o crear la materia
                    const [materia] = await sequelize.query(
                      `INSERT INTO materias (nombre, created_at)
                       VALUES (:nombre, NOW())
                       ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre
                       RETURNING id`,
                      {
                        replacements: {
                          nombre: materiaData.nombre
                        },
                        type: sequelize.QueryTypes.INSERT,
                        transaction
                      }
                    );

                    const materia_id = materia[0].id;

                    // Luego crear la nota
                    await sequelize.query(
                      `INSERT INTO notas 
                       (estudiante_id, materia_id, valor, observaciones, periodo, fecha)
                       VALUES 
                       (:estudiante_id, :materia_id, :valor, :observaciones, :periodo, NOW())`,
                      {
                        replacements: {
                          estudiante_id: estudiante.id,
                          materia_id: materia_id,
                          valor: materiaData.calificacion,
                          observaciones: materiaData.observacion,
                          periodo: materiaData.periodo
                        },
                        transaction
                      }
                    );
                  }
                  
                  // Calcular y actualizar el promedio después de insertar todas las notas
                  const [promedio] = await sequelize.query(
                    `SELECT ROUND(COALESCE(AVG(valor), 0)::numeric, 2) as promedio
                     FROM notas
                     WHERE estudiante_id = :estudiante_id`,
                    {
                      replacements: {
                        estudiante_id: estudiante.id
                      },
                      type: sequelize.QueryTypes.SELECT,
                      transaction
                    }
                  );

                  // Actualizar el promedio del estudiante
                  await sequelize.query(
                    `UPDATE estudiantes
                     SET promedio = :promedio
                     WHERE id = :estudiante_id`,
                    {
                      replacements: {
                        estudiante_id: estudiante.id,
                        promedio: promedio.promedio
                      },
                      transaction
                    }
                  );
                }
              } catch (error) {
                console.error('Error procesando materias:', error);
                throw new Error('Error al procesar las materias: ' + error.message);
              }
            }
          }

          results.success.push({
            username: user.username,
            role: user.role,
            grupo: role === 'estudiante' ? row.grupo : undefined
          });

        } catch (error) {
          console.error('Error procesando fila:', error);
          results.errors.push({
            username: row.username || 'desconocido',
            error: error.message
          });
        }
      }

      await transaction.commit();
      await fs.unlink(req.file.path);

      return res.json({
        message: 'Proceso completado',
        resultados: {
          exitosos: results.success.length,
          errores: results.errors.length,
          detalles: results
        }
      });

    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error('Error general:', error);

      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error eliminando archivo temporal:', unlinkError);
        }
      }

      return res.status(500).json({
        error: 'Error al procesar el archivo',
        details: error.message
      });
    }
  });
});

module.exports = uploadRouter;