const Sequelize = require('sequelize/index');

const sequelize = new Sequelize('<DB_NAME>', '<USERNAME>', '<PASSWORD>', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;