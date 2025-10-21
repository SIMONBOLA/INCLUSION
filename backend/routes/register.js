const express = require('express');
const router = express.Router();

// Ruta para manejar el registro de usuarios
router.post('/', (req, res) => {
  const { username, password } = req.body;

  // Aquí puedes agregar lógica para guardar el usuario en la base de datos
  res.status(200).json({ message: 'Usuario registrado con éxito' });
});

module.exports = router;