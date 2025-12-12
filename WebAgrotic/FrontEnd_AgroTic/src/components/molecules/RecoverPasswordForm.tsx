import React, { useState } from "react";
import CustomButton from "../atoms/Boton";
import UserInputs from "../atoms/UserInputs"; 
import { recoverPassword } from "../../services/RecoverPasswordService";

const RecoverPasswordForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    if (!email.trim()) {
      setErrors({ email: "Por favor, ingresa tu correo electrónico." });
      return;
    }

    setIsLoading(true);
    try {
      const data = await recoverPassword(email);
      setSuccessMessage(
        data.message || "Se ha enviado un enlace de recuperación a tu correo."
      );
      setEmail("");
    } catch (error: any) {
      setErrors({
        email:
          error.response?.data?.message ||
          "Error al intentar recuperar contraseña.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Usamos UserInputs solo con email */}
      <UserInputs email={email} setEmail={setEmail} errors={errors} />

      {/* Mensaje de éxito */}
      {successMessage && (
        <p className="text-center text-primary-500 text-sm">{successMessage}</p>
      )}

      {/*Botón */}
      <CustomButton
        text="Enviar"
        type="submit"
        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 w-full disabled:bg-primary-400"
        disabled={isLoading}
      />
    </form>
  );
};

export default RecoverPasswordForm;

