import React, { useState } from "react";
import CustomButton from "../atoms/Boton";
import UserInputs from "../atoms/UserInputs";
import type { LoginFormProps } from "../../types/login.types";

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dni || !password) {
      setMessage("Por favor, complete todos los campos.");
      return;
    }


    onLogin({ dni: parseInt(dni, 10), password });
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <UserInputs
        dni={dni}
        setDni={setDni}
        password={password}
        setPassword={setPassword}
      />

      {message && <p className="text-center text-red-500">{message}</p>}

      <CustomButton
        text="Iniciar sesión"
        type="submit"
        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 w-full"
      />

      <a
        href="/register"
        className="text-xs mt-2 text-gray-500 hover:underline w-full text-center block"
      >
        ¿No tienes una cuenta? Regístrate
      </a>
      <a
        href="/recover-password"
        className="text-xs mt-2 text-gray-500 hover:underline w-full text-center block"
      >
        ¿Olvidaste tu contraseña?
      </a>
    </form>
  );
};

export default LoginForm;




