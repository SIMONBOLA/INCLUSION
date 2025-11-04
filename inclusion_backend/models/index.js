const sequelize = require('../utils/db');
const User = require('./user');
const Estudiante = require('./estudiante');
const Nota = require('./nota');
const Materia = require('./materia');

// Relaciones
Estudiante.belongsTo(User, { foreignKey: 'user_id', as: 'usuario' });
User.hasOne(Estudiante, { foreignKey: 'user_id', as: 'estudiante' });
Estudiante.hasMany(Nota, { foreignKey: 'estudiante_id', as: 'notas' });
Nota.belongsTo(Estudiante, { foreignKey: 'estudiante_id', as: 'estudiante' });
Nota.belongsTo(Materia, { foreignKey: 'materia_id', as: 'materia' });
Nota.belongsTo(User, { foreignKey: 'profesor_id', as: 'docente' });
User.hasMany(Nota, { foreignKey: 'profesor_id', as: 'notas_docente' });

module.exports = {
  sequelize,
  User,
  Estudiante,
  Nota,
  Materia
};
