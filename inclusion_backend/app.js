const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const usersController = require('./controllers/users')
const contactController = require('./controllers/contactos')
const estudiantesController = require('./controllers/estudiantes')
const loginController = require('./controllers/login')
const uploadController = require('./controllers/upload')
const registerController = require('./controllers/register')
const notasController = require('./controllers/notas')
const materiasController = require('./controllers/materias')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const informeRouter = require('./controllers/informe')


// Middlewares base
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(middleware.requestLogger)

// Rutas que NO requieren autenticación
app.use('/api/estudiantes', estudiantesController) // Sin autenticación para estudiantes
app.use('/api/upload', uploadController) // Ruta para carga masiva

// Ruta para mensajes de contacto
app.use('/api/contact', contactController)

// Token extractor puede ir global si lo usas para logging, pero userExtractor solo en rutas protegidas
app.use(middleware.tokenExtractor)
app.use('/api/usuarios', middleware.userExtractor, usersController)
app.use('/api/notas', middleware.userExtractor, notasController)
app.use('/api/materias', middleware.userExtractor, materiasController)
app.use('/api/informes', middleware.userExtractor, informeRouter)

// Rutas públicas
app.use('/api/login', loginController)
app.use('/api/register', registerController)

// Error handling
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})

module.exports = app

