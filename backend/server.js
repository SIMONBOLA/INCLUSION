const http = require('http')
const app = require('./app')
const logger = require('./utils/logger')

let server = null

const normalizePort = (val) => {
  const port = parseInt(val, 10)
  
  if (isNaN(port)) return val
  if (port >= 0) return port
  
  return false
}

const startServer = () => {
  const port = normalizePort(process.env.PORT || '3001')
  
  if (server) {
    logger.info('Cerrando servidor existente...')
    server.close()
  }

  server = http.createServer(app)

  server.listen(port)

  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error
    }

    switch (error.code) {
      case 'EACCES':
        logger.error(`Puerto ${port} requiere privilegios elevados`)
        process.exit(1)
        break
      case 'EADDRINUSE':
        logger.error(`Puerto ${port} ya está en uso`)
        process.exit(1)
        break
      default:
        throw error
    }
  })

  server.on('listening', () => {
    const addr = server.address()
    logger.info(`Servidor escuchando en puerto ${addr.port}`)
  })
}

module.exports = { startServer }