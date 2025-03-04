const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  connectionLimit: 10,
  database: "prescription_database",
  password: process.env.PASSWORD,
});

module.exports = db;
