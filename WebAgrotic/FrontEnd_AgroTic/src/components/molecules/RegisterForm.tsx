import React, { useState } from "react";
import CustomButton from "../atoms/Boton";
import UserInputs from "../atoms/UserInputs";
import type { RegisterFormProps } from "../../types/Register";
import type { RegisterFormData } from "../../types/Auth";
import { registerUser } from "../../services/authService";
import Swal from "sweetalert2"; 
type ErrorState = {
  nombres?: string;
  apellidos?: string;
  dni?: string;
  telefono?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

const RegisterForm: React.FC<RegisterFormProps> = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    nombres: "",
    apellidos: "",
    dni: "",
    telefono: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<ErrorState>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const data = await registerUser(formData);

      Swal.fire({
        icon: "success",
        title: "¡Registro exitoso!",
        text: data.message || "Usuario registrado correctamente",
        confirmButtonText: "Iniciar sesión",
        confirmButtonColor: "#16a34a", 
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/login"; 
        }
      });

      // Limpiar formulario
      setFormData({
        nombres: "",
        apellidos: "",
        dni: "",
        telefono: "",
        email: "",
        password: "",
      });
    } catch (err: any) {
      let newErrors: ErrorState = {};

      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data.message === "string") {
          newErrors.general = data.message;
        } else if (Array.isArray(data.message)) {
          data.message.forEach((msg: string) => {
            if (msg.toLowerCase().includes("correo")) newErrors.email = msg;
            else if (msg.toLowerCase().includes("contraseña")) newErrors.password = msg;
            else if (msg.toLowerCase().includes("dni")) newErrors.dni = msg;
            else if (msg.toLowerCase().includes("nombre")) newErrors.nombres = msg;
            else if (msg.toLowerCase().includes("apellido")) newErrors.apellidos = msg;
            else if (msg.toLowerCase().includes("teléfono")) newErrors.telefono = msg;
            else newErrors.general = msg;
          });
        } else if (data.error) {
          newErrors.general = data.error;
        }
      } else if (err.request) {
        newErrors.general = "No se pudo conectar con el servidor.";
      } else {
        newErrors.general = `Error inesperado: ${err.message}`;
      }

      setErrors(newErrors);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <UserInputs
        {...formData}
        setNombres={(val) => setFormData({ ...formData, nombres: val })}
        setApellidos={(val) => setFormData({ ...formData, apellidos: val })}
        setDni={(val) => setFormData({ ...formData, dni: val })}
        setEmail={(val) => setFormData({ ...formData, email: val })}
        setTelefono={(val) => setFormData({ ...formData, telefono: val })}
        setPassword={(val) => setFormData({ ...formData, password: val })}
        errors={errors}
      />

      {errors.general && (
        <p className="text-red-500 text-sm text-center">{errors.general}</p>
      )}

      <CustomButton
        text={isLoading ? "Registrando..." : "Registrarse"}
        type="submit"
        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 w-full disabled:bg-primary-400"
        disabled={isLoading}
      />
    </form>
  );
};

export default RegisterForm;




