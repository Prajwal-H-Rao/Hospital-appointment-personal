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
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Data Section */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Appointments */}
          <div className="bg-white rounded-lg shadow p-4 flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-3">Appointments</h2>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b-2 border-amber-100">
                    <th className="p-1 text-left">Patient</th>
                    <th className="p-1">Date</th>
                    <th className="p-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment.appointment_id}
                      className="border-b border-amber-50 hover:bg-amber-50"
                    >
                      <td className="p-1">{appointment.patient_name}</td>
                      <td className="p-1 text-center">
                        {new Date(
                          appointment.appointment_date
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-1 text-center">
                        <span
                          className={`px-1 rounded ${
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

          {/* Staff Lists */}
          <div className="flex gap-4 flex-1 min-h-0">
            {/* Doctors */}
            <div className="bg-white rounded-lg shadow p-4 flex-1 flex flex-col">
              <h2 className="text-lg font-semibold mb-3">Doctors</h2>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b-2 border-amber-100">
                      <th className="p-1 text-left">Name</th>
                      <th className="p-1">Department</th>
                      <th className="p-1">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doctor) => (
                      <tr
                        key={doctor.doctor_id}
                        className="border-b border-amber-50 hover:bg-amber-50"
                      >
                        <td className="p-1">{doctor.doctor_name}</td>
                        <td className="p-1 text-center">
                          {doctor.doctor_specialization}
                        </td>
                        <td className="p-1 text-center">
                          {doctor.doctor_contact}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Nurses */}
            <div className="bg-white rounded-lg shadow p-4 flex-1 flex flex-col">
              <h2 className="text-lg font-semibold mb-3">Nurses</h2>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b-2 border-amber-100">
                      <th className="p-1 text-left">Name</th>
                      <th className="p-1">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nurses.map((nurse) => (
                      <tr
                        key={nurse.nurse_id}
                        className="border-b border-amber-50 hover:bg-amber-50"
                      >
                        <td className="p-1">{nurse.nurse_name}</td>
                        <td className="p-1 text-center">
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
    </div>
  );
};

export default AdminDashboard;
