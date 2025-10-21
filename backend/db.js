// backend/util/db.js
const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
})

// Prueba de conexión
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err)
  } else {
    console.log('Conexión exitosa a la base de datos')
    done()
  }
})

module.exports = pool