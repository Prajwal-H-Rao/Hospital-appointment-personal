import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import AppointmentForm from "./components/AppointmentForm/Appointment";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" Component={Login} />
        <Route path="/" Component={Home} />
        <Route path="/appointments" Component={AppointmentForm} />
      </Routes>
    </>
  );
};

export default App;
