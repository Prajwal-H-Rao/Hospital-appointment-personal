import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [prescription, setPrescription] = useState({
    appointment_id: "",
    medicines: [{ medicine_name: "", medicine_dosage: "" }],
  });
  const [message, setMessage] = useState({ type: "", content: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Authentication check and fetch appointments
  useEffect(() => {
    const token = Cookies.get("authToken");
    const role = Cookies.get("userRole");
    const doctorId = Cookies.get("doctorId");

    if (!token || role !== "doctor" || !doctorId) {
      navigate("/login");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/treat/appointments/${doctorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response.data);
        setAppointments(response.data);
      } catch (error) {
        setMessage({ type: "error", content: "Failed to fetch appointments" });
      }
    };

    fetchAppointments();
  }, [navigate]);

  // Handle prescription form changes
  const handlePrescriptionChange = (index, e) => {
    const newMedicines = prescription.medicines.map((med, i) =>
      index === i ? { ...med, [e.target.name]: e.target.value } : med
    );
    setPrescription({ ...prescription, medicines: newMedicines });
  };

  const addMedicineField = () => {
    setPrescription({
      ...prescription,
      medicines: [
        ...prescription.medicines,
        { medicine_name: "", medicine_dosage: "" },
      ],
    });
  };

  // Submit prescription
  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = Cookies.get("authToken");
      const doctorId = Cookies.get("doctorId");

      await axios.post(
        "http://localhost:3000/treat/prescriptions",
        {
          appointment_id: prescription.appointment_id,
          doctor_id: doctorId,
          medicines: prescription.medicines,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage({
        type: "success",
        content: "Prescription added successfully",
      });
      setPrescription({
        appointment_id: "",
        medicines: [{ medicine_name: "", medicine_dosage: "" }],
      });
    } catch (error) {
      setMessage({
        type: "error",
        content: error.response?.data?.message || "Failed to add prescription",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete appointment
  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        const token = Cookies.get("authToken");

        await axios.delete(
          `http://localhost:3000/treat/requests/appointment/${appointmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAppointments(
          appointments.filter((app) => app.appointment_id !== appointmentId)
        );
        setMessage({
          type: "success",
          content: "Appointment deleted successfully",
        });
      } catch (error) {
        setMessage({ type: "error", content: "Failed to delete appointment" });
      }
    }
  };

  return (
    <div className="h-screen bg-amber-50 p-8 flex flex-col">
      <div className="h-4" />
      {/* Header Section */}
      <div className="flex items-center  mb-8">
        <div className="h-full min-w-5" />
        <h1 className="text-3xl font-bold flex-9/12">Doctor Dashboard</h1>
        <div>
          <button
            onClick={() => {
              Cookies.remove("authToken");
              navigate("/login");
            }}
            className="bg-gradient-to-r from-amber-300 to-amber-400 w-28 h-10 flex items-center justify-center text-center rounded-full text-white font-semibold shadow-md hover:shadow-lg transform hover:cursor-pointer hover:scale-105 transition-all duration-300"
          >
            Logout
          </button>
        </div>
        <div className="h-full min-w-5" />
      </div>

      <div className="h-4" />
      <div className="flex">
        {message.content && (
          <>
            <div className="h-full min-w-8 " />
            <div
              className={`mb-6 p-4 flex-11/12 rounded-lg ${
                message.type === "success" ? " text-green-800" : " text-red-800"
              }`}
            >
              {message.content}
            </div>
          </>
        )}
      </div>
      <div className="h-2" />
      {/* Main Content Container */}
      <div className=" flex gap-8 h-9/12 ">
        {/* Appointments Table */}
        <div className="h-full" />
        <div className="flex-1 bg-white rounded-lg shadow-md p-6 flex flex-col">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Appointments
          </h2>
          <div className="flex-1 ">
            <div className="h-full max-h-[calc(100vh-200px)] overflow-y-auto">
              <table className="w-full ">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b-2 border-amber-100">
                    <th className="text-center py-3 px-4">
                      <span className="w-1"></span>Patient
                    </th>
                    <th className="text-center py-3 px-4">Date</th>
                    <th className="text-center py-3 px-4">Time</th>
                    <th className="text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment.appointment_id}
                      className="border-b border-amber-50 hover:bg-amber-50"
                    >
                      <td className="py-3 px-4 text-center">
                        {appointment.patient_name}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {new Date(
                          appointment.appointment_date
                        ).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {appointment.appointment_time}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            handleDeleteAppointment(appointment.appointment_id)
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Prescription Form */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6 flex flex-col">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Add Prescription
          </h2>
          <form
            onSubmit={handlePrescriptionSubmit}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                <div className="inline-block w-[1rem]"></div>Select Appointment
              </label>
              <div>
                <div className="inline-block w-4"></div>
                <select
                  value={prescription.appointment_id}
                  onChange={(e) =>
                    setPrescription({
                      ...prescription,
                      appointment_id: e.target.value,
                    })
                  }
                  className="w-4/5 h-[2.5rem] p-2 border rounded-md "
                  required
                >
                  <option value="">Select an appointment</option>
                  {appointments.map((appointment) => (
                    <option
                      key={appointment.appointment_id}
                      value={appointment.appointment_id}
                    >
                      {appointment.patient_name} -{" "}
                      {new Date(
                        appointment.appointment_date
                      ).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="h-full max-h-[calc(100vh-300px)] overflow-y-auto">
                <table className="w-full  min-h-fu">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="">
                      <th className="text-center py-3 px-4">Medicine</th>
                      <th className="text-center py-3 px-4">Dosage</th>
                      <th className="text-center py-3 px-4">Dosage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescription.medicines.map((medicine, index) => (
                      <tr key={index} className="border-b border-amber-50">
                        <td className="py-2 px-4">
                          <div className="h-full inline-block w-4" />
                          <input
                            type="text"
                            name="medicine_name"
                            placeholder="Medicine name"
                            value={medicine.medicine_name}
                            onChange={(e) => handlePrescriptionChange(index, e)}
                            className="w-10/12 p-2 border-b focus:outline-none"
                            required
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            name="medicine_dosage"
                            placeholder="Dosage"
                            value={medicine.medicine_dosage}
                            onChange={(e) => handlePrescriptionChange(index, e)}
                            className="w-10/12 p-2 border-b focus:outline-none"
                            required
                          />
                        </td>
                        <td className="py-2 px-4 text-center">
                          <button
                            onClick={() => {
                              const newMedicines =
                                prescription.medicines.filter(
                                  (_, i) => i !== index
                                );
                              setPrescription({
                                ...prescription,
                                medicines: newMedicines,
                              });
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex items-center">
              <div className="h-full w-[1rem]" />
              <button
                type="button"
                onClick={addMedicineField}
                className="text-amber-600 flex-1 hover:text-amber-800 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Medicine
              </button>

              <div className="h-[3rem]">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-amber-300 flex-1 to-amber-400 w-36 h-10 flex items-center justify-center text-center rounded-full text-white text-sm font-semibold shadow-md hover:shadow-lg transform hover:cursor-pointer hover:scale-105 transition-all duration-300"
                >
                  {loading ? "Submitting..." : "Save Prescription"}
                </button>
              </div>
              <div className="h-full w-[1rem]" />
            </div>
          </form>
        </div>
        <div className="h-full" />
      </div>
    </div>
  );
};

export default DoctorDashboard;
