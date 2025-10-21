const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const rutasUsuarios = require('./routes/users')
const rutasComentarios = require('./routes/comments')
const loginRouter = require('./controllers/login')
const registerRouter = require('./controllers/register')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')

// Middlewares
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

// Routes
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

// En cada componente que haga peticiones (Inicio.jsx, Notas.jsx, etc.)
const loadStudents = async () => {
  try {
    const response = await axios.get('http://localhost:3001/api/usuarios/estudiantes')
    setStudents(response.data)
  } catch (error) {
    console.error('Error al cargar estudiantes:', error)
  }
}

const loadComments = async () => {
  try {
    const response = await axios.get('http://localhost:3001/api/comentarios')
    setComments(response.data)
  } catch (error) {
    console.error('Error al cargar comentarios:', error)
  }
}

