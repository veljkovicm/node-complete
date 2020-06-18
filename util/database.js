// const mysql = require('mysql2');

// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   database: 'node-complete',
//   password: 'Loktar321'
// });

// module.exports = pool.promise();


const Sequelize = require('sequelize/index');

const sequelize = new Sequelize('<DB_NAME>', '<USERNAME>', '<PASSWORD>', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;

