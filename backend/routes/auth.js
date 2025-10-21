const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')
const logger = require('../utils/logger')

router.post('/register', async (req, res) => {
  try {
    const { username, password, nombre, role } = req.body
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const result = await pool.query(
      'INSERT INTO usuarios (username, password, nombre, role) VALUES ($1, $2, $3, $4) RETURNING id, username, nombre, role',
      [username, passwordHash, nombre, role]
    )

    logger.info('Usuario registrado:', username)
    res.status(201).json(result.rows[0])
  } catch (error) {
    logger.error('Error en registro:', error)
    res.status(500).json({ error: 'Error en el registro' })
  }
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1',
      [username]
    )

    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
    }

    const passwordCorrect = await bcrypt.compare(password, user.password)

    if (!passwordCorrect) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.SECRET
    )

    res.status(200).json({
      token,
      username: user.username,
      nombre: user.nombre,
      role: user.role
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

module.exports = router