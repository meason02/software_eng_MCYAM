const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_CONTAINER || 'db',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
