const router = require('express').Router()
const { Note } = require('../models')
router.get('/', async (req, res) => {
    const notes = await Note.findAll()
    res.json(notes)
  })
  router.post('/', async (req, res) => {
    try {
      const note = await Note.create(req.body)
      res.json(note)
    } catch (error) {
      return res.status(400).json({ error })
    }
  })
    