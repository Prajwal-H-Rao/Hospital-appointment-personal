import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const NurseDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorsByDepartment, setDoctorsByDepartment] = useState({});
  const [paymentData, setPaymentData] = useState({
    appointment_id: "",
    payment_status: "unpaid",
    amount: "",
    payment_method: "cash",
  });
  const [message, setMessage] = useState({ type: "", content: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (message.content) {
      timer = setTimeout(() => {
        setMessage({ type: "", content: "" });
      }, 3000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [message.content]);

  useEffect(() => {
    const token = Cookies.get("authToken");
    const role = Cookies.get("userRole");
    const nurseId = Cookies.get("nurseId");

    if (!token || role !== "nurse" || !nurseId) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const doctorsRes = await axios.get(
          "https://appointment-backend-x08l.onrender.com/manage/doctors",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const groupedDoctors = doctorsRes.data.data.reduce((acc, doctor) => {
          acc[doctor.department] = acc[doctor.department] || [];
          acc[doctor.department].push(doctor);
          return acc;
        }, {});
        setDoctorsByDepartment(groupedDoctors);

        const requestsRes = await axios.get(
          "https://appointment-backend-x08l.onrender.com/manage/requests",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRequests(
          requestsRes.data.map((request) => ({
            ...request,
            selectedDoctorId: "",
            selectedCriticality: "",
          }))
        );

        const appsRes = await axios.get(
          `https://appointment-backend-x08l.onrender.com/manage/nurse/${nurseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAppointments(appsRes.data.data);
      } catch (error) {
        setMessage({ type: "error", content: "Failed to fetch data" });
      }
    };

    fetchData();
  }, [navigate]);

  const handleDoctorSelect = (requestId, doctorId) => {
    setRequests(
      requests.map((req) =>
        req.request_id === requestId
          ? { ...req, selectedDoctorId: doctorId }
          : req
      )
    );
  };

  const handleCriticalitySelect = (requestId, criticality) => {
    setRequests(
      requests.map((req) =>
        req.request_id === requestId
          ? { ...req, selectedCriticality: criticality }
          : req
      )
    );
  };

  const approveRequest = async (request) => {
    if (!request.selectedDoctorId || !request.selectedCriticality) {
      setMessage({
        type: "error",
        content: "Please select doctor and criticality",
      });
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get("authToken");
      await axios.post(
        "https://appointment-backend-x08l.onrender.com/manage/appointments",
        {
          request_id: request.request_id,
          patient_name: request.name,
          patient_contact: request.contact,
          doctor_id: request.selectedDoctorId,
          nurse_id: Cookies.get("nurseId"),
          appointment_date: request.appointment_date,
          appointment_time: request.appointment_time,
          gender: request.gender,
          age: request.age,
          critical: request.selectedCriticality,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await axios.get(
        `https://appointment-backend-x08l.onrender.com/manage/nurse/${Cookies.get(
          "nurseId"
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments(res.data.data);
      setRequests(
        requests.filter((req) => req.request_id !== request.request_id)
      );

      setMessage({ type: "success", content: "Request approved successfully" });
    } catch (error) {
      setMessage({ type: "error", content: "Approval failed" });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = Cookies.get("authToken");
      await axios.put(
        "https://appointment-backend-x08l.onrender.com/manage/appointments/payment",
        paymentData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({ type: "success", content: "Payment updated successfully" });
      setPaymentData({
        appointment_id: "",
        payment_status: "unpaid",
        amount: "",
        payment_method: "cash",
      });

      const res = await axios.get(
        `https://appointment-backend-x08l.onrender.com/manage/nurse/${Cookies.get(
          "nurseId"
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments(res.data.data);
    } catch (error) {
      setMessage({ type: "error", content: "Payment update failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-amber-50 p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Nurse Dashboard</h1>
        <button
          onClick={() => {
            Cookies.remove("authToken");
            navigate("/login");
          }}
          className="bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
        >
          Logout
        </button>
      </div>

      {/* Message Display */}
      {message.content && (
        <div
          className={`mb-4 p-4 rounded-lg z-10 ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.content}
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Pending Requests */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-4 flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Pending Requests
          </h2>
          <div className="flex-grow overflow-hidden">
            <div className="h-[300px] overflow-y-auto">
              <table className="w-full min-w-[800px]">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b-2 border-amber-100">
                    <th className="p-2 text-left text-gray-600">Patient</th>
                    <th className="p-2 text-left text-gray-600">Contact</th>
                    <th className="p-2 text-left text-gray-600">Department</th>
                    <th className="p-2 text-left text-gray-600">Date</th>
                    <th className="p-2 text-left text-gray-600">Doctor</th>
                    <th className="p-2 text-left text-gray-600">Criticality</th>
                    <th className="p-2 text-right text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr
                      key={request.request_id}
                      className="border-b border-amber-50 hover:bg-amber-50"
                    >
                      <td className="p-2 text-gray-700">{request.name}</td>
                      <td className="p-2 text-gray-600">{request.contact}</td>
                      <td className="p-2 text-gray-600">
                        {request.department}
                      </td>
                      <td className="p-2 text-gray-600">
                        {new Date(
                          request.appointment_date
                        ).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <select
                          className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                          onChange={(e) =>
                            handleDoctorSelect(
                              request.request_id,
                              e.target.value
                            )
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
                      <td className="p-2">
                        <select
                          className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
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
                      <td className="p-2 text-right">
                        <button
                          onClick={() => approveRequest(request)}
                          disabled={
                            loading ||
                            !request.selectedDoctorId ||
                            !request.selectedCriticality
                          }
                          className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-1 rounded-lg hover:shadow-md transition-all duration-300 disabled:opacity-50"
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
        </div>

        {/* Right Column */}
        <div className="w-96 flex flex-col gap-4">
          {/* Appointments List */}
          <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Scheduled Appointments
            </h2>
            <div className="flex-1 overflow-y-auto h-[300px]">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b-2 border-amber-100">
                    <th className="p-2 text-left text-gray-600">Patient</th>
                    <th className="p-2 text-left text-gray-600">Date</th>
                    <th className="p-2 text-left text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment.appointment_id}
                      className="border-b border-amber-50 hover:bg-amber-50"
                    >
                      <td className="p-2 text-gray-700">
                        {appointment.patient_name}
                      </td>
                      <td className="p-2 text-gray-600">
                        {new Date(
                          appointment.appointment_date
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-2">
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
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
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
                  className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
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
                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
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
                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
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
                  className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-md transition-all duration-300 disabled:opacity-75"
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

export default NurseDashboard;
