import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import DoctorDashboard from "./pages/Dashboard/Doctor/Doctor";
import Appointment from "./pages/Home/Appointment";
import NurseDashboard from "./pages/Dashboard/Nurse/Nurse";
const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" Component={Login} />
        <Route path="/" Component={Home} />
        <Route path="/doctor-dashboard" Component={DoctorDashboard} />
        <Route path="/nurse-dashboard" Component={NurseDashboard} />
        <Route path="/appointments" Component={Appointment} />
      </Routes>
    </>
  );
};

export default App;
