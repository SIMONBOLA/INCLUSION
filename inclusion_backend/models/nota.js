const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

class Nota extends Model {}

Nota.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    estudiante_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    materia_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    valor: {
      type: DataTypes.DECIMAL(4,2),
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    periodo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    observaciones: {
      type: DataTypes.TEXT,
    },
    profesor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    created_by: {
      type: DataTypes.INTEGER,
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
    modelName: 'notas',
  }
);

Nota.associate = (models) => {
  Nota.belongsTo(models.Estudiante, { foreignKey: 'estudiante_id', as: 'estudiante' });
  Nota.belongsTo(models.Materia, { foreignKey: 'materia_id', as: 'materia' });
};

module.exports = Nota;
