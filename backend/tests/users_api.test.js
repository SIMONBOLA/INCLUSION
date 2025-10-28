const { test, describe, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const db = require('../db')
const bcrypt = require('bcrypt')

describe('API de usuarios', () => {
  beforeEach(async () => {
    // Limpiar la tabla de usuarios
    await db.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE')
    
    // Crear algunos usuarios de prueba
    const password = await bcrypt.hash('testpass123', 10)
    
    await db.query(`
      INSERT INTO users (username, password_hash, nombre, role) 
      VALUES 
        ('profesor1', $1, 'Profesor Test', 'profesor'),
        ('estudiante1', $1, 'Estudiante 1', 'estudiante'),
        ('estudiante2', $1, 'Estudiante 2', 'estudiante')
    `, [password])
  })

  test('obtener estudiantes retorna 401 sin token', async () => {
    const response = await api
      .get('/api/usuarios/estudiantes')
      .expect(401)
      .expect('Content-Type', /application\\/json/)

    assert.strictEqual(response.body.error, 'Token no proporcionado')
  })

  test('obtener estudiantes retorna 403 con token de estudiante', async () => {
    // Primero hacer login como estudiante
    const loginResponse = await api
      .post('/api/login')
      .send({
        username: 'estudiante1',
        password: 'testpass123'
      })

    const response = await api
      .get('/api/usuarios/estudiantes')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .expect(403)
      .expect('Content-Type', /application\\/json/)

    assert.strictEqual(response.body.error, 'No tienes permiso para acceder a este recurso')
  })

  test('obtener estudiantes funciona con token de profesor', async () => {
    // Primero hacer login como profesor
    const loginResponse = await api
      .post('/api/login')
      .send({
        username: 'profesor1',
        password: 'testpass123'
      })

    const response = await api
      .get('/api/usuarios/estudiantes')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .expect(200)
      .expect('Content-Type', /application\\/json/)

    assert.strictEqual(response.body.length, 2)
    assert.strictEqual(response.body[0].role, 'estudiante')
    assert.strictEqual(response.body[1].role, 'estudiante')
  })
})

// Limpiar recursos después de las pruebas
after(async () => {
  await db.end()
})