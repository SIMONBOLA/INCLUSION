const express = require('express')
const rutasUsuarios = express.Router()
const pool = require('../db')
const bcrypt = require('bcrypt')

// Obtener todos los usuarios
rutasUsuarios.get('/', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT id, nombre, email, role FROM usuarios')
    res.json(resultado.rows)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Obtener estudiantes
rutasUsuarios.get('/estudiantes', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, nombre, email, role FROM usuarios WHERE role = $1',
      ['estudiante']
    )
    res.json(resultado.rows)
  } catch (error) {
    console.error('Error al obtener estudiantes:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Obtener notas de un estudiante
rutasUsuarios.get('/estudiantes/:id/notas', async (req, res) => {
  try {
    const idEstudiante = req.params.id
    const resultado = await pool.query(
      'SELECT * FROM notas WHERE id_estudiante = $1',
      [idEstudiante]
    )
    res.json(resultado.rows)
  } catch (error) {
    console.error('Error al obtener notas:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Agregar nueva nota
rutasUsuarios.post('/estudiantes/:id/notas', async (req, res) => {
  try {
    const idEstudiante = req.params.id
    const { materia, notaAnterior, notaActual } = req.body

    // Validar entrada
    if (!materia || notaAnterior === undefined || notaActual === undefined) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' })
    }

    const resultado = await pool.query(
      `INSERT INTO notas (id_estudiante, materia, nota_anterior, nota_actual) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [idEstudiante, materia, notaAnterior, notaActual]
    )
    
    res.status(201).json(resultado.rows[0])
  } catch (error) {
    console.error('Error al agregar nota:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Actualizar nota
rutasUsuarios.put('/estudiantes/:idEstudiante/notas/:idNota', async (req, res) => {
  try {
    const { idEstudiante, idNota } = req.params
    const { materia, notaAnterior, notaActual } = req.body

    const resultado = await pool.query(
      `UPDATE notas 
       SET materia = $1, nota_anterior = $2, nota_actual = $3 
       WHERE id = $4 AND id_estudiante = $5 
       RETURNING *`,
      [materia, notaAnterior, notaActual, idNota, idEstudiante]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Nota no encontrada' })
    }

    res.json(resultado.rows[0])
  } catch (error) {
    console.error('Error al actualizar nota:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Eliminar nota
rutasUsuarios.delete('/estudiantes/:idEstudiante/notas/:idNota', async (req, res) => {
  try {
    const { idEstudiante, idNota } = req.params

    const resultado = await pool.query(
      'DELETE FROM notas WHERE id = $1 AND id_estudiante = $2 RETURNING *',
      [idNota, idEstudiante]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Nota no encontrada' })
    }

    res.status(204).end()
  } catch (error) {
    console.error('Error al eliminar nota:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// En los componentes frontend que hacen peticiones
const baseURL = 'http://localhost:3001/api'; // Asegúrate que este es el puerto correcto

// En Inicio.jsx, Notas.jsx, y Graficas.jsx actualiza las llamadas:
const loadStudents = async () => {
  try {
    const response = await axios.get(`${baseURL}/users/estudiantes`)
    setStudents(response.data)
  } catch (error) {
    console.error('Error loading students:', error)
  }
}

const loadStudentGrades = async (studentId) => {
  try {
    const response = await axios.get(`${baseURL}/users/estudiantes/${studentId}/notas`)
    setGrades(response.data)
  } catch (error) {
    console.error('Error loading grades:', error)
  }
}

module.exports = rutasUsuarios