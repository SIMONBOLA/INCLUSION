const jwt = require('jsonwebtoken');
const config = require('../utils/config');

const authMiddleware = (req, res, next) => {
  const authHeader = req.get('authorization') || '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'token missing' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({ error: 'token invalid' });
    }
    req.userId = decoded.id;
    req.user = decoded; // Incluir toda la información del usuario
    next();
  } catch (err) {
    return res.status(401).json({ error: 'token invalid or expired' });
  }
};

module.exports = authMiddleware;