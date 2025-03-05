require("dotenv").config();
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 3000;

const db = require("./database/db");
const authRouter = require("./routes/Auth/login");
const appointmentRouter = require("./routes/Home/Appointment_Page/appointment");
const nurseRouter = require("./routes/Home/Nurse_Dashboard/nurse");
const doctorRoute = require("./routes/Home/Doctor_dashboard/doctor");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", authRouter);
app.use("/appointment", appointmentRouter);
app.use("/manage", nurseRouter);
app.use("/treat", doctorRoute);

db.query("SELECT 1", (err) => {
  if (err) {
    console.log("Error connecting to the database");
    return;
  }
  app.listen(port, () => {
    console.log(`The server is running on port:${port}`);
  });
});
