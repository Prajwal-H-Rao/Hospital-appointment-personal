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
    if (message.content) {
      setTimeout(() => {
        setMessage({ type: "", content: "" });
      });
      return () => clearTimeout(timer);
    }
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
        // Fetch doctors and group by department
        const doctorsRes = await axios.get(
          "http://localhost:3000/manage/doctors",
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

        // Fetch pending requests
        const requestsRes = await axios.get(
          "http://localhost:3000/manage/requests",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Initialize selections
        setRequests(
          requestsRes.data.map((request) => ({
            ...request,
            selectedDoctorId: "",
            selectedCriticality: "",
          }))
        );

        // Fetch appointments
        const appsRes = await axios.get(
          `http://localhost:3000/manage/nurse/${nurseId}`,
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
        "http://localhost:3000/manage/appointments",
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
        `http://localhost:3000/manage/nurse/${Cookies.get("nurseId")}`,
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
        "http://localhost:3000/manage/appointments/payment",
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

      // Refresh appointments
      const res = await axios.get(
        `http://localhost:3000/manage/nurse/${Cookies.get("nurseId")}`,
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
    <div className="h-screen bg-amber-50 p-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold flex-grow">Nurse Dashboard</h1>
        <button
          onClick={() => {
            Cookies.remove("authToken");
            navigate("/login");
          }}
          className="bg-gradient-to-r from-amber-300 to-amber-400 w-28 h-10 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
        >
          Logout
        </button>
        <div className="h-full min-w-5" />
      </div>

      {/* Message Display */}
      <div className="flex">
        {message.content && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === "success" ? " text-green-800" : " text-red-800"
            }`}
          >
            {message.content}
          </div>
        )}
      </div>
      {/* Main Content */}
      <div className="flex gap-8 flex-1 min-h-0">
        {/* Pending Requests */}
        <div className="flex-1/2 bg-white rounded-lg shadow-md p-6 flex flex-col">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Pending Requests
          </h2>
          <div className="flex-grow overflow-y-auto">
            {/* Pending Requests Table */}
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b-2 border-amber-100">
                  <th className="p-3">Patient</th>
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
                    <td className="p-3 text-center">{request.name}</td>
                    <td className="p-3 text-center">{request.contact}</td>
                    <td className="p-3 text-center">{request.department}</td>
                    <td className="p-3 text-center">
                      {new Date(request.appointment_date).toLocaleDateString()}
                    </td>

                    {/* Doctor Selection Column */}
                    <td className="p-3 text-center">
                      <select
                        className="w-full p-2 border rounded"
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

                    {/* Criticality Selection Column */}
                    <td className="p-3 text-center">
                      <select
                        className="w-full p-2 border rounded"
                        onChange={(e) =>
                          handleCriticalitySelect(
                            request.request_id,
                            e.target.value
                          )
                        }
                        value={request.selectedCriticality}
                      >
                        <option value="">Select Criticality</option>
                        <option value="low">Low</option>
                        <option value="mid">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </td>

                    {/* Approve Button Column */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => approveRequest(request)}
                        disabled={
                          loading ||
                          !request.selectedDoctorId ||
                          !request.selectedCriticality
                        }
                        className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 w-full"
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

        {/* Appointments & Payment */}
        <div className="flex-1/3 flex flex-col min-h-0 gap-6">
          {/* Appointments List */}
          <div className="bg-white rounded-lg shadow-md p-4 flex flex-col flex-1 min-h-0">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Scheduled Appointments
            </h2>
            <div className="overflow-y-auto flex-1">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b-2 border-amber-100">
                    <th className="p-3">Patient</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment.appointment_id}
                      className="border-b border-amber-50 hover:bg-amber-50"
                    >
                      <td className="p-3 text-center">
                        {appointment.patient_name}
                      </td>
                      <td className="p-3 text-center">
                        {new Date(
                          appointment.appointment_date
                        ).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-center">
                        {appointment.appointment_time}
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
          {/* Payment Update Form */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Update Payment
            </h2>
            <form onSubmit={handlePaymentUpdate} className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                <div className="space-y-1">
                  <label className="block text-sm">Appointment</label>
                  <select
                    value={paymentData.appointment_id}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        appointment_id: e.target.value,
                      })
                    }
                    className="w-full p-1 text-sm border rounded"
                    required
                  >
                    <option value="">Select Appointment</option>
                    {appointments.map((app) => (
                      <option
                        key={app.appointment_id}
                        value={app.appointment_id}
                      >
                        {app.patient_name} -
                        {new Date(app.appointment_date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm">Status</label>
                  <select
                    value={paymentData.payment_status}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        payment_status: e.target.value,
                      })
                    }
                    className="w-full p-1 text-sm border rounded"
                    required
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentData.amount}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, amount: e.target.value })
                    }
                    className="w-full p-1 text-sm border rounded"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm">Method</label>
                  <select
                    value={paymentData.payment_method}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full p-1 text-sm border rounded"
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-300 to-amber-400 h-8 rounded text-white text-sm font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
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
