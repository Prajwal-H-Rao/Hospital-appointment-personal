import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
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
    <div className="h-screen bg-amber-50 p-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold flex-grow">Nurse Dashboard</h1>
        <button
          onClick={() => {
            Cookies.remove("authToken");
            navigate("/login");
          }}
          className="bg-gradient-to-r from-amber-300 to-amber-400 px-6 py-2 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
        >
          Logout
        </button>
      </div>

      {/* Message Display */}
      {message.content && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.content}
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-8 flex-1 min-h-0">
        {/* Pending Requests */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-6 flex flex-col">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Pending Requests
          </h2>
          <div className="flex-grow overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b-2 border-amber-100">
                  <th className="p-3 text-left">Patient</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Criticality</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.request_id}
                    className="border-b border-amber-50 hover:bg-amber-50"
                  >
                    <td className="p-3">{request.name}</td>
                    <td className="p-3 text-center">{request.contact}</td>
                    <td className="p-3 text-center">{request.department}</td>
                    <td className="p-3 text-center">
                      {new Date(request.appointment_date).toLocaleDateString()}
                    </td>

                    {/* Doctor Selection */}
                    <td className="p-3">
                      <select
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                        onChange={(e) =>
                          handleDoctorSelect(request.request_id, e.target.value)
                        }
                        value={request.selectedDoctorId}
                      >
                        <option value="">Select Doctor</option>
                        {doctorsByDepartment[request.department]?.map(
                          (doctor) => (
                            <option
                              key={doctor.doctor_id}
                              value={doctor.doctor_id}
                            >
                              Dr. {doctor.name} ({doctor.specialization})
                            </option>
                          )
                        )}
                      </select>
                    </td>

                    {/* Criticality Selection */}
                    <td className="p-3">
                      <select
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                        onChange={(e) =>
                          handleCriticalitySelect(
                            request.request_id,
                            e.target.value
                          )
                        }
                        value={request.selectedCriticality}
                      >
                        <option value="">Criticality</option>
                        <option value="low">Low</option>
                        <option value="mid">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </td>

                    {/* Approve Button */}
                    <td className="p-3">
                      <button
                        onClick={() => approveRequest(request)}
                        disabled={
                          loading ||
                          !request.selectedDoctorId ||
                          !request.selectedCriticality
                        }
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-2 rounded-lg hover:shadow-md transition-all duration-300 disabled:opacity-50"
                      >
                        {loading ? "Processing..." : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-96 flex flex-col gap-6">
          {/* Appointments List */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col flex-1">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Scheduled Appointments
            </h2>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b-2 border-amber-100">
                    <th className="p-3 text-left">Patient</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment.appointment_id}
                      className="border-b border-amber-50 hover:bg-amber-50"
                    >
                      <td className="p-3">{appointment.patient_name}</td>
                      <td className="p-3 text-center">
                        {new Date(
                          appointment.appointment_date
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded ${
                            appointment.payment_status === "paid"
                              ? "bg-green-200 text-green-800"
                              : "bg-red-200 text-red-800"
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

          {/* Payment Update Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Update Payment
            </h2>
            <form onSubmit={handlePaymentUpdate} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Appointment</label>
                <select
                  value={paymentData.appointment_id}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      appointment_id: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  required
                >
                  <option value="">Select Appointment</option>
                  {appointments.map((app) => (
                    <option key={app.appointment_id} value={app.appointment_id}>
                      {app.patient_name} -{" "}
                      {new Date(app.appointment_date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Status</label>
                  <select
                    value={paymentData.payment_status}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        payment_status: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                    required
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Method</label>
                  <select
                    value={paymentData.payment_method}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, amount: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-md transition-all duration-300 disabled:opacity-75"
              >
                {loading ? "Updating..." : "Update Payment"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
