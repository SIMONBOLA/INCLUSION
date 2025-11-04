const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Contactos = sequelize.define('Contactos', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'contactos',
  timestamps: false
});

module.exports = Contactos;
