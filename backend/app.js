const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const rutasUsuarios = require('./routes/users')
const rutasComentarios = require('./routes/comments')
const rutasEstudiantes = require('./routes/estudiantes')
const loginRouter = require('./controllers/login')
const registerRouter = require('./controllers/register')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')

// Middlewares base
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(middleware.requestLogger)

// Rutas que NO requieren autenticación
app.use('/api/estudiantes', rutasEstudiantes) // Sin autenticación para estudiantes

// Rutas que SÍ requieren autenticación
app.use(middleware.tokenExtractor)
app.use(middleware.userExtractor)
app.use('/api/usuarios', rutasUsuarios)
app.use('/api/comentarios', rutasComentarios)
app.use('/api/login', loginRouter)
app.use('/api/register', registerRouter)

// Error handling
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})

module.exports = app

