const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DiaryVideo = sequelize.define('DiaryVideo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  diary_id: { type: DataTypes.INTEGER, allowNull: false },
  video_url: { type: DataTypes.STRING(255), allowNull: false }
}, {
  tableName: 'diary_videos',
  timestamps: false
});

module.exports = DiaryVideo;