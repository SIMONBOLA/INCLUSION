const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

class Estudiante extends Model {}

Estudiante.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    grupo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    promedio: {
      type: DataTypes.DECIMAL(4,2),
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'estudiante',
  }
);

Estudiante.associate = (models) => {
  Estudiante.hasMany(models.Nota, { foreignKey: 'estudiante_id', as: 'notas' });
};

module.exports = Estudiante;
