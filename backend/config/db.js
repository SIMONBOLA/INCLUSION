const { Pool } = require('pg')
const logger = require('../utils/logger')

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432
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