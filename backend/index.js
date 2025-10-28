require('events').EventEmitter.defaultMaxListeners = 20;
require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const { testConnection } = require('./db');
const { initializeUsersTable } = require('./models/user');

const PORT = process.env.PORT || 3001;

const initializeApp = async () => {
  try {
    // Probar la conexión a la base de datos
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('No se pudo establecer conexión con la base de datos');
    }

    // Inicializar la tabla de usuarios
    await initializeUsersTable();
    logger.info('Base de datos inicializada correctamente');

    // Iniciar el servidor
    app.listen(PORT, () => {
      logger.info(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    logger.error('Error al inicializar la aplicación:', error);
    process.exit(1);
  }
};

initializeApp();
