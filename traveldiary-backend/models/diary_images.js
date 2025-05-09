const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DiaryImage = sequelize.define('DiaryImage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  diary_id: { type: DataTypes.INTEGER, allowNull: false },
  image_url: { type: DataTypes.STRING(255), allowNull: false }
}, {
  tableName: 'diary_images',
  timestamps: false
});

module.exports = DiaryImage;