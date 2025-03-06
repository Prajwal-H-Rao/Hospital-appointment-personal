import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [loadingPrescription, setLoadingPrescription] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    department: "",
    email: "",
    password: "",
    contact: "",
  });
  const [newNurse, setNewNurse] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
  });
  const [message, setMessage] = useState({ type: "", content: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, docsRes, nursesRes] = await Promise.all([
          axios.get("http://localhost:3000/admin/appointments"),
          axios.get("http://localhost:3000/admin/doctors"),
          axios.get("http://localhost:3000/admin/nurses"),
        ]);
        setAppointments(appsRes.data);
        setDoctors(docsRes.data);
        setNurses(nursesRes.data);
      } catch (error) {
        setMessage({ type: "error", content: "Failed to fetch data" });
      }
    };

    fetchData();
  }, []);

  const fetchPrescription = async (appointmentId) => {
    try {
      setLoadingPrescription(true);
      const response = await axios.get(
        `http://localhost:3000/admin/prescriptions/${appointmentId}`
      );
      setPrescription(response.data);
      console.log(response.data);
    } catch (error) {
      setMessage({ type: "error", content: "Failed to fetch prescription" });
      setPrescription(null);
    } finally {
      setLoadingPrescription(false);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/admin/doctors", newDoctor);
      setMessage({ type: "success", content: "Doctor created successfully" });
      setNewDoctor({
        name: "",
        department: "",
        email: "",
        password: "",
        contact: "",
      });
      const res = await axios.get("http://localhost:3000/admin/doctors");
      setDoctors(res.data);
    } catch (error) {
      setMessage({ type: "error", content: "Failed to create doctor" });
    }
  };

  const handleCreateNurse = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/admin/nurses", newNurse);
      setMessage({ type: "success", content: "Nurse created successfully" });
      setNewNurse({ name: "", email: "", password: "", contact: "" });
      const res = await axios.get("http://localhost:3000/admin/nurses");
      setNurses(res.data);
    } catch (error) {
      setMessage({ type: "error", content: "Failed to create nurse" });
    }
  };

  return (
    <div className="h-screen bg-amber-50 p-6 flex flex-col">
      {/* Header Section */}
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold flex-grow">Admin Dashboard</h1>
        <button
          onClick={() => {
            Cookies.remove("authToken");
            navigate("/login");
          }}
          className="bg-gradient-to-r from-amber-300 to-amber-400 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300"
        >
          Logout
        </button>
      </div>

      {/* Message Display */}
      {message.content && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.content}
        </div>
      )}

      {/* Main Content Container */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Data Section */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Appointments */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex-1 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Appointments
            </h2>
            <div className="flex-1 overflow-hidden">
              <div className="h-[300px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-gray-200">
                      <th className="p-3 text-left text-gray-600 font-medium">
                        Patient
                      </th>
                      <th className="p-3 text-left text-gray-600 font-medium">
                        Doctor
                      </th>
                      <th className="p-3 text-left text-gray-600 font-medium">
                        Date
                      </th>
                      <th className="p-3 text-left text-gray-600 font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          fetchPrescription(appointment.appointment_id);
                        }}
                        key={appointment.appointment_id}
                        className="border-b border-gray-100 hover:bg-amber-50 transition-colors"
                      >
                        <td className="p-3 text-gray-800">
                          {appointment.patient_name}
                        </td>
                        <td className="p-3 text-gray-800">
                          {doctors.find(
                            (d) => d.doctor_id === appointment.doctor_id
                          )?.doctor_name || "N/A"}
                        </td>
                        <td className="p-3 text-gray-600">
                          {new Date(
                            appointment.appointment_date
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              appointment.payment_status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {appointment.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Staff Section */}
          <div className="flex gap-6 flex-1 min-h-0">
            {/* Doctors */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex-1 flex flex-col">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Doctors
              </h2>
              <div className="flex-1 overflow-y-scroll">
                <div className="h-[300px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-gray-200">
                        <th className="p-3 text-left text-gray-600 font-medium">
                          Name
                        </th>
                        <th className="p-3 text-left text-gray-600 font-medium">
                          Department
                        </th>
                        <th className="p-3 text-left text-gray-600 font-medium">
                          Contact
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((doctor) => (
                        <tr
                          key={doctor.doctor_id}
                          className="border-b border-gray-100 hover:bg-amber-50 transition-colors"
                        >
                          <td className="p-3 text-gray-800">
                            {doctor.doctor_name}
                          </td>
                          <td className="p-3 text-gray-600">
                            {doctor.doctor_specialization}
                          </td>
                          <td className="p-3 text-gray-600">
                            {doctor.doctor_contact}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Nurses */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex-1 flex flex-col">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Nurses
              </h2>
              <div className="flex-1 overflow-y-scroll">
                <div className="h-[300px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-gray-200">
                        <th className="p-3 text-left text-gray-600 font-medium">
                          Name
                        </th>
                        <th className="p-3 text-left text-gray-600 font-medium">
                          Contact
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {nurses.map((nurse) => (
                        <tr
                          key={nurse.nurse_id}
                          className="border-b border-gray-100 hover:bg-amber-50 transition-colors"
                        >
                          <td className="p-3 text-gray-800">
                            {nurse.nurse_name}
                          </td>
                          <td className="p-3 text-gray-600">
                            {nurse.nurse_contact}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Forms Section */}
        <div className="w-96 flex flex-col gap-4 min-h-0">
          {/* Create Doctor Form */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col">
            <h2 className="text-lg font-semibold mb-3">Create Doctor</h2>
            <form onSubmit={handleCreateDoctor} className="space-y-3">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-2 border rounded text-sm"
                  value={newDoctor.name}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, name: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Department"
                  className="w-full p-2 border rounded text-sm"
                  value={newDoctor.department}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, department: e.target.value })
                  }
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 border rounded text-sm"
                  value={newDoctor.email}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, email: e.target.value })
                  }
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-2 border rounded text-sm"
                  value={newDoctor.password}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, password: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Contact Number"
                  className="w-full p-2 border rounded text-sm"
                  value={newDoctor.contact}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, contact: e.target.value })
                  }
                  required
                  pattern="[0-9]{10}"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-amber-600"
              >
                Create Doctor
              </button>
            </form>
          </div>

          {/* Create Nurse Form */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col">
            <h2 className="text-lg font-semibold mb-3">Create Nurse</h2>
            <form onSubmit={handleCreateNurse} className="space-y-3">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-2 border rounded text-sm"
                  value={newNurse.name}
                  onChange={(e) =>
                    setNewNurse({ ...newNurse, name: e.target.value })
                  }
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 border rounded text-sm"
                  value={newNurse.email}
                  onChange={(e) =>
                    setNewNurse({ ...newNurse, email: e.target.value })
                  }
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-2 border rounded text-sm"
                  value={newNurse.password}
                  onChange={(e) =>
                    setNewNurse({ ...newNurse, password: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Contact Number"
                  className="w-full p-2 border rounded text-sm"
                  value={newNurse.contact}
                  onChange={(e) =>
                    setNewNurse({ ...newNurse, contact: e.target.value })
                  }
                  required
                  pattern="[0-9]{10}"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-amber-600"
              >
                Create Nurse
              </button>
            </form>
          </div>
        </div>
      </div>
      {selectedAppointment && (
        <div className="fixed inset-0  bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Prescription Details
              </h3>
              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  setPrescription(null);
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
              <div className="text-center py-8 flex items-center justify-center space-x-2 text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500"></div>
                <span>Loading prescription...</span>
              </div>
            ) : prescription ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
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
                      {doctors.find(
                        (d) => d.doctor_id === selectedAppointment.doctor_id
                      )?.doctor_name || "N/A"}
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

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Medications
                  </h4>
                  {prescription?.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-amber-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-amber-800">
                              Medicine
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-amber-800">
                              Dosage
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {prescription.map((medicine, index) => (
                            <tr
                              key={index}
                              className="hover:bg-amber-50 transition-colors"
                            >
                              <td className="px-4 py-3 text-gray-800 font-medium">
                                {medicine.medicine_name}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {medicine.medicine_dosage}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-amber-50 rounded-lg">
                      <p className="text-gray-500">No medications prescribed</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
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

export default AdminDashboard;
