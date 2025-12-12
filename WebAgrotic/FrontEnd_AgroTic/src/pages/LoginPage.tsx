import React from "react";
import { useNavigate } from "react-router-dom";
import LoginCard from "../components/organisms/LoginCard";
import logo from "../assets/AgroTic_normal.png";
import { usePermission } from "../contexts/PermissionContext";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = usePermission();

  const handleLogin = async (payload: { dni: number; password: string }) => {
    try {
      await login(payload);
      navigate("/app");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-white px-6 overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <img
          src={logo}
          alt="Logo"
          className="w-40 sm:w-56 md:w-80 lg:w-96 h-auto mb-6 object-contain"
        />
      </div>

      <div className="flex-1 flex justify-center w-full mt-6 md:mt-0">
        <LoginCard onLogin={handleLogin} />
      </div>
    </div>
  );
};

export default LoginPage;


