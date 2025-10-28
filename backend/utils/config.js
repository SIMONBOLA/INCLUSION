require('dotenv').config()

const config = {
  // Server configuration
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  DB_USER: process.env.PG_USER || 'postgres',
  DB_HOST: process.env.PG_HOST || 'localhost',
  DB_NAME: process.env.PG_DATABASE || 'postgres',
  DB_PASSWORD: process.env.PG_PASSWORD || 'ANNY',
  DB_PORT: process.env.PG_PORT || 5432,
  
  // Security
  JWT_SECRET: process.env.SECRET || 'your-secret-key',
  
  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Feature flags
  ENABLE_LOGGING: process.env.ENABLE_LOGGING === 'true',
  ENABLE_AUTH: process.env.ENABLE_AUTH !== 'false',
}

// Validación de configuración crítica
const requiredConfig = ['DB_USER', 'DB_PASSWORD', 'JWT_SECRET']
for (const key of requiredConfig) {
  if (!config[key]) {
    throw new Error(`Missing required configuration: ${key}`)
  }
}

module.exports = config
