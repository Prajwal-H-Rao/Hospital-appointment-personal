import React from "react";
import "./App.css";
import Login from "./pages/Auth/Login";
import Navbar from "./components/Navbar/Navbar";
const App = () => {
  return (
    <>
      <Navbar />
      <Login />
    </>
  );
};

export default App;
