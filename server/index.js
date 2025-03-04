require("dotenv").config();
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 3000;

const db = require("./database/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

db.query("SELECT 1", (err) => {
  if (err) {
    console.log("Error connecting to the database");
    return;
  }
  app.listen(port, () => {
    console.log(`The server is running on port:${port}`);
  });
});
