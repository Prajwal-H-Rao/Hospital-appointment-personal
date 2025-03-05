const express = require("express");
const db = require("../../database/db.js");
const jwt = require("jsonwebtoken");

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

router.post("/login", (req, res) => {
  const { email, password, role } = req.body;
  const Template = "SELECT * FROM USERS WHERE email=?";
  db.query(Template, [email], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return;
    }
    if (results[0].password === password) {
      const token = jwt.sign(
        {
          user_id: results[0].user_id,
          email: results[0].email,
          user_role: results[0].role,
        },
        SECRET,
        { expiresIn: "1d" }
      );
      res.status(200).json({ token, email, role });
    } else if (results[0].password !== password) {
      res.status(401).json({ message: "unauthorized" });
    } else {
      res.status(500).json({ message: "somthing went wrong please try again" });
    }
  });
});

module.exports = router;
