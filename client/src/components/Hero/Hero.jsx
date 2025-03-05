import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      className="bg-cover bg-center h-[91.6vh] w-full flex justify-center items-center"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
      }}
    >
      <div className=" p-8 w-3/5 relative">
        <div className="absolute left-5 top-0">
          <div className="flex flex-col items-center">
            <h1 className="text-5xl font-bold text-amber-500">
              Welcome to Our Service
            </h1>
            <p className="text-xl text-amber-300">
              Providing exceptional service since 2025
            </p>
            <div className="h-8"></div> {/* Spacer */}
            <Link to="/appointments">
              <div className="bg-gradient-to-r from-amber-300 to-amber-400 w-48 h-12 flex items-center justify-center rounded-full text-white font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                Book an Appointment
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
