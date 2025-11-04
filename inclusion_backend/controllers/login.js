const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/user');
const pool = require('../config/db');
const logger = require('../utils/logger');

// Login route
loginRouter.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });

    const user = await User.findOne({ where: { username } });
    console.log('User found:', user);

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const passwordCorrect = await bcrypt.compare(password, user.password_hash);
    if (!passwordCorrect) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const userForToken = {
      username: user.username,
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(userForToken, process.env.SECRET);

    res.status(200).send({
      token,
      id: user.id,
      username: user.username,
      name: user.nombre,
      role: user.role,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = loginRouter;