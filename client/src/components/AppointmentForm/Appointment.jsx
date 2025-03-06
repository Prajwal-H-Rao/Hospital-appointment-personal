import React, { useState } from "react";
import axios from "axios";

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    appointment_date: "",
    appointment_time: "",
    gender: "",
    age: "",
    department: "",
  });
  const [message, setMessage] = useState({ type: "", content: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://appointment-backend-x08l.onrender.com/appointment/request",
        formData
      );

      // Handle successful response
      setMessage({
        type: "success",
        content: response.data.message || "Appointment requested successfully!",
      });

      // Reset form
      setFormData({
        name: "",
        contact: "",
        appointment_date: "",
        appointment_time: "",
        gender: "",
        age: "",
        department: "",
      });
    } catch (error) {
      // Handle error response
      const errorMessage =
        error.response?.data?.message ||
        "Failed to book appointment. Please try again.";

      setMessage({
        type: "error",
        content: errorMessage,
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-amber-50">
      <div className="p-8 rounded-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">
          Book Appointment
        </h2>
        {message.content && (
          <div
            className={`mb-4 p-4 rounded text-center ${
              message.type === "success" ? "text-green-800" : "text-red-800"
            }`}
          >
            {message.content}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-gray-700 font-medium mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 h-10 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>

            {/* Contact Field */}
            <div>
              <label
                htmlFor="contact"
                className="block text-gray-700 font-medium mb-2"
              >
                Contact Number
              </label>
              <input
                type="tel"
                id="contact"
                value={formData.contact}
                onChange={handleChange}
                className="w-full px-4 py-2 h-10 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>

            {/* Date and Time Picker */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="appointment_date"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]} // Disable past dates
                  className="w-full px-4 py-2 h-10 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="appointment_time"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Time
                </label>
                <input
                  type="time"
                  id="appointment_time"
                  value={formData.appointment_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 h-10 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label
                htmlFor="gender"
                className="block text-gray-700 font-medium mb-2"
              >
                Gender
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>

            {/* Age Field */}
            <div>
              <label
                htmlFor="age"
                className="block text-gray-700 font-medium mb-2"
              >
                Age
              </label>
              <input
                type="number"
                id="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-2 h-10 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>

            {/* Department Selection */}
            <div>
              <label
                htmlFor="department"
                className="block text-gray-700 font-medium mb-2"
              >
                Department
              </label>
              <select
                id="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              >
                <option value="">Select Department</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="General-Medicine">General-Medicine</option>
              </select>
            </div>
          </div>

          <div className="h-6" />
          {/* Submit Button */}
          <div className="flex justify-center h-10">
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-300 to-amber-400 w-full py-2 rounded-full text-white text-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Book Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
