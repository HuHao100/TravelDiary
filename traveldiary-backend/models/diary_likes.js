const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DiaryLike = sequelize.define('DiaryLike', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  diary_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'diary_likes',
  timestamps: false
});

module.exports = DiaryLike;