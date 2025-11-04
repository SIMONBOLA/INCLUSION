const express = require('express');
const ContactosRouter = express.Router();

const Contactos = require('../models/contactos');

// POST /api/contact
ContactosRouter.post('/', async (req, res) => {
  const { nombre, email, mensaje } = req.body;
  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
  const nuevoMensaje = await Contactos.create({ nombre, email, mensaje });
    res.status(201).json({ message: 'Mensaje recibido correctamente', id: nuevoMensaje.id });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar el mensaje' });
  }
});

module.exports = ContactosRouter;
