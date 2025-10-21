const express = require('express')
const rutasComentarios = express.Router()
const pool = require('../db')

rutasComentarios.get('/', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM comentarios ORDER BY fecha_creacion DESC')
    res.json(resultado.rows)
  } catch (error) {
    console.error('Error al obtener comentarios:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

module.exports = rutasComentarios