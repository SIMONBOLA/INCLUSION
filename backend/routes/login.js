const express = require('express');
const router = express.Router();

// Ruta para manejar el login
router.post('/', (req, res) => {
  const { username, password } = req.body;

  // Verificar si faltan credenciales
  if (!username || !password) {
    return res.status(400).json({ message: 'Faltan credenciales' });
  }

  // Responder con éxito para pruebas
  res.status(200).json({ message: 'Login exitoso' });
});

module.exports = router;