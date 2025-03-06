import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "https://appointment-backend-x08l.onrender.com/login",
        {
          email,
          password,
        }
      );

      // Store authentication data
      Cookies.set("authToken", response.data.token, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });

      Cookies.set("userRole", response.data.role, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });

      // Store role-specific ID
      if (response.data.role === "doctor") {
        Cookies.set("doctorId", response.data.userId, {
          expires: 1,
          secure: true,
          sameSite: "strict",
        });
      } else if (response.data.role === "nurse") {
        Cookies.set("nurseId", response.data.userId, {
          expires: 1,
          secure: true,
          sameSite: "strict",
        });
      } else {
        Cookies.set("adminId", response.data.userId, {
          expires: 1,
          secure: true,
          sameSite: "strict",
        });
      }

      // Redirect to appropriate dashboard
      navigate(`/${response.data.role}-dashboard`, {
        state: { freshLogin: true },
        replace: true,
      });
    } catch (error) {
      let errorMessage = "Something went wrong. Please try again.";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
        // Clear cookies on authentication errors
        if ([401, 403].includes(error.response.status)) {
          Cookies.remove("authToken");
          Cookies.remove("userRole");
          Cookies.remove("doctorId");
        }
      }
      setMessage({ type: "error", content: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-[91.4vh] w-full bg-amber-50">
        <div className="p-8 rounded-lg w-full max-w-md relative">
          <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
          {message.content && (
            <div
              className={`mb-6 absolute top-18 left-20 p-1 rounded-lg z-10 ${
                message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                  autoComplete="username"
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-amber-300 to-amber-400 w-full py-2 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
