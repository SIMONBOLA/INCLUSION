const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Estudiante } = require('../models');
const sequelize = require('../utils/db');
const registerRouter = express.Router();

const createUser = async (userData, transaction) => {
  const { username, password, nombre, role } = userData;
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  return await User.create({
    username,
    password_hash: passwordHash,
    nombre,
    role
  }, { transaction });
};

const createEstudiante = async (userId, grupo, transaction) => {
  return await Estudiante.create({
    user_id: userId,
    grupo,
    promedio: 0.0
  }, { transaction });
};

registerRouter.post('/', async (req, res) => {
  const { username, password, nombre, role, grupo } = req.body;
  console.log('Datos recibidos en el backend:', req.body);

  // Iniciar transacción
  const transaction = await sequelize.transaction();

  try {
    // Validaciones iniciales
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Se requieren nombre de usuario y contraseña' 
      });
    }

    // Validar el rol
    if (!['estudiante', 'profesor', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Rol no válido. Debe ser estudiante, profesor o admin'
      });
    }

    // Si es un estudiante, validar que tenga grupo asignado
    if (role === 'estudiante' && !grupo) {
      return res.status(400).json({
        error: 'Los estudiantes deben tener un grupo asignado'
      });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ 
      where: { username },
      transaction
    });

    if (userExists) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'El nombre de usuario ya está en uso' 
      });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear el usuario
    const newUser = await User.create({
      username,
      password_hash: passwordHash,
      nombre,
      role
    }, { transaction });

    // Si es estudiante, crear el registro correspondiente
    if (role === 'estudiante') {
      await Estudiante.create({
        user_id: newUser.id,
        grupo: grupo,
        promedio: 0.0,
        asistencia: 100,
        fecha_ingreso: new Date()
      }, { transaction });

      // Obtener el usuario con la información del estudiante
      const userWithStudent = await User.findByPk(newUser.id, {
        include: [{ model: Estudiante, as: 'estudiante' }],
        transaction
      });

      // Confirmar la transacción
      await transaction.commit();

      return res.status(201).json({
        message: 'Usuario estudiante registrado exitosamente',
        user: userWithStudent
      });
    }

    // Si no es estudiante, solo confirmar y devolver el usuario
    await transaction.commit();

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: newUser
    });

  } catch (error) {
    // Asegurarse de hacer rollback si algo falla
    await transaction.rollback();
    console.error('Error en registro:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario',
      details: error.message 
    });
  }
});

module.exports = registerRouter;