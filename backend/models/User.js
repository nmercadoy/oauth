const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // tu instancia de conexión

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING }
});

module.exports = User;