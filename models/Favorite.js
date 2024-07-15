// models/Favorite.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Favorite = sequelize.define('Favorite', {
  baseCurrency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetCurrency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

module.exports = Favorite;
