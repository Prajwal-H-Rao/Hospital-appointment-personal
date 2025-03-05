const express = require("express");
const db = require("../../../database/db.js");

const router = express.Router();

// Get all appointments for a doctor
router.get("/appointments/:doctor_id", (req, res) => {
  const { doctor_id } = req.params;
  const query = "SELECT * FROM APPOINTMENTS WHERE doctor_id = ?";

  db.query(query, [doctor_id], (err, results) => {
    if (err) {
      console.error("Error fetching doctor appointments:", err);
      return res.status(500).json({ message: "Failed to fetch appointments" });
    }
    res.status(200).json(results);
  });
});

// Add multiple medicines to a prescription
router.post("/prescriptions", (req, res) => {
  const { appointment_id, doctor_id, medicines } = req.body; // medicines should be an array of { medicine_name, medicine_dosage }

  if (!Array.isArray(medicines) || medicines.length === 0) {
    return res
      .status(400)
      .json({ message: "Medicines must be a non-empty array" });
  }

  const values = medicines.map((med) => [
    appointment_id,
    doctor_id,
    med.medicine_name,
    med.medicine_dosage,
  ]);
  const query = `
    INSERT INTO PRESCRIPTIONS (appointment_id, doctor_id, medicine_name, medicine_dosage)
    VALUES ?
  `;

  db.query(query, [values], (err, result) => {
    if (err) {
      console.error("Error adding prescriptions:", err);
      return res.status(500).json({ message: "Failed to add prescriptions" });
    }

    res.status(201).json({
      message: "Prescriptions added successfully",
      affectedRows: result.affectedRows,
    });
  });
});

// Delete appointment request using appointment_id
router.delete("/requests/appointment/:appointment_id", (req, res) => {
  const { appointment_id } = req.params;

  const query = `
    DELETE FROM APPOINTMENT_REQUESTS
    WHERE (name, contact, appointment_date) IN (
      SELECT patient_name, patient_contact, appointment_date
      FROM APPOINTMENTS
      WHERE appointment_id = ?
    )
  `;

  db.query(query, [appointment_id], (err, result) => {
    if (err) {
      console.error("Error deleting appointment request:", err);
      return res
        .status(500)
        .json({ message: "Failed to delete appointment request" });
    }

    res.status(200).json({
      message: "Appointment request deleted successfully",
      affectedRows: result.affectedRows,
    });
  });
});

module.exports = router;
