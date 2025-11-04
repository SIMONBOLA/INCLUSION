const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const User = require('./user');
const Estudiante = require('./estudiante');

const Informe = sequelize.define('Informe', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  estudianteId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  profesorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  materias: {
    type: DataTypes.JSON,
    allowNull: false
  },
  analisis: {
    type: DataTypes.JSON,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'informes',
  timestamps: false
});
// Asociaciones
Informe.belongsTo(User, { as: 'profesor', foreignKey: 'profesorId' });
Informe.belongsTo(Estudiante, { as: 'estudiante', foreignKey: 'estudianteId' });

module.exports = Informe;
