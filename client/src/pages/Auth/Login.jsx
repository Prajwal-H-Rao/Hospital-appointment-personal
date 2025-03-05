import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("doctor");
  const [message, setMessage] = useState({ type: "", content: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3000/login", { email, password, role })
      .then((response) => {
        // Successful login (HTTP 200)
        setMessage({ type: "success", content: "Login successful!" });
        // Optionally, store the token or redirect the user here:
        // localStorage.setItem("token", response.data.token);
      })
      .catch((error) => {
        if (error.response) {
          // Use the message sent by the backend for 404 (User not found) or 401 (Unauthorized)
          setMessage({
            type: "error",
            content: error.response.data.message || "An error occurred.",
          });
        } else {
          setMessage({
            type: "error",
            content: "Something went wrong. Please try again.",
          });
        }
      });
  };

  return (
    <div className="flex justify-center items-center h-[91.4vh] w-full bg-amber-50">
      <div className="p-8 h-1/2 rounded-lg w-1/2 max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
        {message.content && (
          <div
            className={`mb-4 p-4 rounded text-center${
              message.type === "success" ? " text-green-800" : " text-red-800"
            }`}
          >
            {message.content}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 h-[2.5rem] text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-lg px-4 py-4 h-[2.5rem] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
            {/* Role Selection */}
            <div>
              <label
                htmlFor="role"
                className="block text-gray-700 font-medium mb-2"
              >
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 h-[2rem] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              >
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
              </select>
            </div>
          </div>
          <div className="h-6" />
          {/* Submit Button */}
          <div className="flex justify-center h-[2.5rem]">
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-300 to-amber-400 w-full py-3 rounded-full text-white text-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
