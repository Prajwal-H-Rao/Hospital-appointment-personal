import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-amber-100 shadow-md h-16 py-4 flex items-center font-poppins">
      {/* Logo Section */}
      <div className="w-1/4 flex items-center justify-center">
        <h1 className="font-bold text-2xl">Logo</h1>
      </div>

      {/* Navigation Links */}
      <div className="w-1/2">
        <ul className="list-none flex items-center justify-center">
          <li>
            <Link
              to="/"
              className="relative group inline-block cursor-pointer text-gray-800 font-medium"
            >
              Home
              <span className="absolute left-0 -bottom-1 h-[2px] bg-gray-800 w-0 group-hover:w-full transition-all duration-300 delay-150"></span>
            </Link>
          </li>

          {/* Spacer Block */}
          <li className="w-1/12" aria-hidden="true"></li>

          <li>
            <Link
              to="/appointments"
              className="relative group inline-block font-medium cursor-pointer text-gray-800"
            >
              Appointments
              <span className="absolute left-0 -bottom-1 h-[2px] bg-gray-800 w-0 group-hover:w-full transition-all duration-300 delay-150"></span>
            </Link>
          </li>

          {/* Spacer Block */}
          <li className="w-1/12" aria-hidden="true"></li>

          <li>
            <Link
              to="/contact"
              className="relative group inline-block cursor-pointer font-medium text-gray-800"
            >
              Contact us
              <span className="absolute left-0 -bottom-1 h-[2px] bg-gray-800 w-0 group-hover:w-full transition-all duration-300 delay-150"></span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Login Button */}
      <div className="w-1/4 flex items-center justify-center">
        <Link to="/login" className="cursor-pointer">
          <div className="bg-gradient-to-r from-amber-300 to-amber-400 w-28 h-10 flex items-center justify-center text-center rounded-full text-white font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            Login
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
