console.log('App starting...');
const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('before sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});
console.log('after sequelize');

module.exports = sequelize;
