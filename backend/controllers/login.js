const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const { findUserByUsername } = require('../models/user');

loginRouter.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });

    const user = await findUserByUsername(username);
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