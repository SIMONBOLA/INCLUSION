const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

class Materia extends Model {}

Materia.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'materias',
  }
);

module.exports = Materia;
