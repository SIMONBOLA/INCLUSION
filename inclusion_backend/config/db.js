const { Pool } = require('pg')
const logger = require('../utils/logger')

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432
})

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect()
    logger.info('Database connection successful')
    client.release()
  } catch (error) {
    logger.error('Database connection error:', error)
    throw error
  }
}

testConnection()

module.exports = pool