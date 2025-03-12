import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionPast, setPrescriptionPast] = useState(null);
  const [loadingPrescription, setLoadingPrescription] = useState(false);
  const [prescription, setPrescription] = useState({
    appointment_id: "",
    medicines: [{ medicine_name: "", medicine_dosage: "" }],
  });
  const [message, setMessage] = useState({ type: "", content: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (message.content) {
      timer = setTimeout(() => {
        setMessage({ type: "", content: "" });
      }, 3000); // Message will auto-close after 3 seconds
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [message.content]);

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
          `https://appointment-backend-x08l.onrender.com/treat/appointments/${doctorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAppointments(response.data);
      } catch (error) {
        setMessage({ type: "error", content: "Failed to fetch appointments" });
      }
    };

    fetchAppointments();
  }, [navigate]);

  const fetchPrescription = async (
    patient_name,
    patient_contact,
    appointment_id
  ) => {
    try {
      setLoadingPrescription(true);
      const response = await axios.get(
        `https://appointment-backend-x08l.onrender.com/treat/appointments/${patient_name}/${patient_contact}/${appointment_id}`
      );
      setPrescriptionPast(response.data);
    } catch (error) {
      setMessage({ type: "error", content: "Failed to fetch prescription" });
      setPrescriptionPast(null);
    } finally {
      setLoadingPrescription(false);
    }
  };
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
        "https://appointment-backend-x08l.onrender.com/treat/prescriptions",
        {
          appointment_id: prescription.appointment_id,
          user_id: doctorId,
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
          `https://appointment-backend-x08l.onrender.com/treat/requests/appointment/${appointmentId}`,
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
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
        <button
          onClick={() => {
            Cookies.remove("authToken");
            navigate("/login");
          }}
          className="bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-2 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
        >
          Logout
        </button>
      </div>

      {/* Message Display */}
      {message.content && (
        <div
          className={`mb-6 absolute p-4 rounded-lg z-10 ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.content}
        </div>
      )}

      {/* Main Content Container */}
      <div className="flex gap-8 flex-1 min-h-0">
        {/* Appointments Table */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-6 flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Appointments
          </h2>
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b-2 border-amber-100">
                    <th className="p-3 text-left text-gray-600">Patient</th>
                    <th className="p-3 text-left text-gray-600">Date</th>
                    <th className="p-3 text-left text-gray-600">Time</th>
                    <th className="p-3 text-right text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment.appointment_id}
                      className="border-b border-amber-50 hover:bg-amber-50"
                    >
                      <td
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          fetchPrescription(
                            appointment.patient_name,
                            appointment.patient_contact,
                            appointment.appointment_id
                          );
                        }}
                        className="p-3 text-gray-700"
                      >
                        {appointment.patient_name}
                      </td>
                      <td className="p-3 text-gray-600">
                        {new Date(
                          appointment.appointment_date
                        ).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-gray-600">
                        {appointment.appointment_time}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() =>
                            handleDeleteAppointment(appointment.appointment_id)
                          }
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
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
        <div className="flex-1 bg-white rounded-xl shadow-lg p-6 flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Add Prescription
          </h2>
          <form
            onSubmit={handlePrescriptionSubmit}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* Appointment Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Select Appointment
              </label>
              <select
                value={prescription.appointment_id}
                onChange={(e) =>
                  setPrescription({
                    ...prescription,
                    appointment_id: e.target.value,
                  })
                }
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                required
              >
                <option value="">Choose an appointment...</option>
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

            {/* Medicines List */}
            <div className="flex-1 overflow-hidden mb-6">
              <div className="h-full max-h-[400px] overflow-y-auto">
                <div className="space-y-4">
                  {prescription.medicines.map((medicine, index) => (
                    <div
                      key={index}
                      className="bg-amber-50 rounded-lg p-4 flex gap-4 items-center"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">
                            Medicine Name
                          </label>
                          <input
                            type="text"
                            name="medicine_name"
                            placeholder="Enter medicine name"
                            value={medicine.medicine_name}
                            onChange={(e) => handlePrescriptionChange(index, e)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">
                            Dosage Instructions
                          </label>
                          <input
                            type="text"
                            name="medicine_dosage"
                            placeholder="Enter dosage details"
                            value={medicine.medicine_dosage}
                            onChange={(e) => handlePrescriptionChange(index, e)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newMedicines = prescription.medicines.filter(
                            (_, i) => i !== index
                          );
                          setPrescription({
                            ...prescription,
                            medicines: newMedicines,
                          });
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={addMedicineField}
                className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-md transition-all duration-300 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
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

              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-green-400 to-green-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-md transition-all duration-300 disabled:opacity-75"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Save Prescription"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      {selectedAppointment && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-4 max-w-2xl w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                Prescription Details
              </h3>
              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  setPrescriptionPast(null);
                }}
                className="text-amber-600 hover:text-amber-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {loadingPrescription ? (
              <div className="text-center py-4 flex items-center justify-center space-x-2 text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500"></div>
                <span>Loading prescription...</span>
              </div>
            ) : prescriptionPast ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Patient
                    </label>
                    <p className="text-gray-800 font-medium">
                      {selectedAppointment.patient_name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Doctor
                    </label>
                    <p className="text-gray-800 font-medium">
                      {prescriptionPast[0]?.doctor_name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Date
                    </label>
                    <p className="text-gray-800">
                      {new Date(
                        selectedAppointment.appointment_date
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Medications
                  </h4>
                  {prescriptionPast?.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-amber-50">
                          <tr>
                            <th className="px-2 py-2 text-left text-sm font-medium text-amber-800">
                              Medicine
                            </th>
                            <th className="px-2 py-2 text-left text-sm font-medium text-amber-800">
                              Dosage
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {prescriptionPast.map((medicine, index) => (
                            <tr
                              key={index}
                              className="hover:bg-amber-50 transition-colors"
                            >
                              <td className="px-2 py-2 text-gray-800 font-medium">
                                {medicine.medicine_name}
                              </td>
                              <td className="px-2 py-2 text-gray-600">
                                {medicine.medicine_dosage}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-amber-50 rounded-lg">
                      <p className="text-gray-500">No medications prescribed</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-red-500 mb-2">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">
                  No prescription found for this appointment
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
