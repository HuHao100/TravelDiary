const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DiaryComment = sequelize.define('DiaryComment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  diary_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  // parent_id: { type: DataTypes.INTEGER, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'diary_comments',
  timestamps: false
});

module.exports = DiaryComment;