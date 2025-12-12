import React, { useState } from "react";
import type { ResetPasswordFormValues } from "../../types/ResetPasswordForm.types";
import UserInputs from "../atoms/UserInputs"; 
import CustomButton from "../atoms/Boton";
import { resetPassword } from "../../services/ResetPasswordService";
import { useSearchParams } from "react-router-dom";

const ResetPasswordForm: React.FC = () => {
  const [form, setForm] = useState<ResetPasswordFormValues>({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // Manejo de errores específicos por campo (para UserInputs)
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrors({});
    setSuccessMessage("");

    const newErrors: typeof errors = {};

    if (!form.password) newErrors.password = "La contraseña es obligatoria.";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Debes confirmar la contraseña.";

    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!token) {
      setError(
        "Token inválido o expirado. Por favor, solicita un nuevo enlace de recuperación."
      );
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, form.password, form.confirmPassword);
      setSuccessMessage(
        "¡Contraseña actualizada correctamente! Ya puedes iniciar sesión."
      );
      setForm({ password: "", confirmPassword: "" });
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Error al actualizar la contraseña."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* 🔹 Usa tu componente UserInputs para los campos */}
      <UserInputs
        password={form.password}
        setPassword={(val) => setForm({ ...form, password: val })}
        confirmPassword={form.confirmPassword}
        setConfirmPassword={(val) => setForm({ ...form, confirmPassword: val })}
        errors={errors}
      />

      {/* Mensajes de error o éxito */}
      {error && <p className="text-center text-red-500 text-sm">{error}</p>}
      {successMessage && (
        <p className="text-center text-primary-500 text-sm">{successMessage}</p>
      )}

      {/* Botón */}
      <CustomButton
        text="Cambiar contraseña"
        type="submit"
        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 w-full disabled:bg-primary-400"
        disabled={isLoading}
      />
    </form>
  );
};

export default ResetPasswordForm;
