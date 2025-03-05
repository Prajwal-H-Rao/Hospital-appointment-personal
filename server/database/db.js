const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  port: 3306,
  connectionLimit: 10,
  database: "prescription_database",
  password: process.env.PASSWORD,
});

module.exports = db;
