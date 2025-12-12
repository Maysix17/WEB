// Importaciones: React hooks, componentes de UI, y servicio de recuperación de contraseña
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import CambioContraCampos from "../../molecules/CambioContraM"; // Componente molecular para campos de contraseña
import CustomButton from "../../atoms/Boton"; // Botón personalizado
import { resetPassword } from "@/services/Modulo Usuarios/RecuperarContra"; // Servicio para resetear contraseña

// Interfaz para props del componente: token de recuperación y callback de éxito
interface CambioContraFormProps {
    token: string; // Token para validar el reset
    onSuccess: () => void; // Función a llamar al completar exitosamente
}

// Componente funcional para el formulario de cambio de contraseña
const CambioContraForm: React.FC<CambioContraFormProps> = ({ token, onSuccess }) => {
    // Estados para los campos del formulario
    const [newPassword, setNewPassword] = useState(""); // Nueva contraseña
    const [confirmPassword, setConfirmPassword] = useState(""); // Confirmación de contraseña
    const [error, setError] = useState<string>(""); // Mensaje de error general
    const [successMessage, setSuccessMessage] = useState<string>(""); // Mensaje de éxito
    const [isLoading, setIsLoading] = useState<boolean>(false); // Indicador de carga

    // Estados para errores específicos por campo
    const [errors, setErrors] = useState<{
        newPassword?: string;
        confirmPassword?: string;
    }>({});

    // Función para manejar el envío del formulario
    const handleSubmit = async () => {
        // Limpiar mensajes previos
        setError("");
        setErrors({});
        setSuccessMessage("");

        // Validar campos obligatorios
        const newErrors: typeof errors = {};

        if (!newPassword) newErrors.newPassword = "La contraseña es obligatoria.";
        if (!confirmPassword) newErrors.confirmPassword = "Debes confirmar la contraseña.";

        // Validar que las contraseñas coincidan
        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden.";
        }

        // Si hay errores, mostrarlos y detener
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Validar token
        if (!token) {
            setError("Token inválido o expirado. Por favor, solicita un nuevo enlace de recuperación.");
            return;
        }

        // Enviar solicitud
        setIsLoading(true);
        try {
            await resetPassword(token, newPassword, confirmPassword); // Llamar al servicio
            setSuccessMessage("¡Contraseña actualizada correctamente! Ya puedes iniciar sesión.");
            // Limpiar campos
            setNewPassword("");
            setConfirmPassword("");
            // Llamar callback de éxito después de delay
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (error: any) {
            // Manejar error de la API
            setError(error.response?.data?.message || "Error al actualizar la contraseña.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Restablecer Contraseña</Text>

            <CambioContraCampos
                newPassword={newPassword} setNewPassword={setNewPassword}
                confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                errors={errors}
            />

            {/* Mensajes de error o éxito */}
            {error && <Text style={styles.errorText}>{error}</Text>}
            {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

            <View style={styles.buttonWrapper}>
                <CustomButton text="Cambiar contraseña" onClick={handleSubmit} disabled={isLoading} />
            </View>
        </View>
    );
};

// --- Estilos Nativos de React Native ---
const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 5,
        width: '100%',
        maxWidth: 448,
        alignSelf: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: '#1f2937',
    },
    buttonWrapper: {
        marginTop: 10,
    },
    errorText: {
        color: '#ef4444', // red-500
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    successText: {
        color: '#22c55e', // green-500
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
});

export default CambioContraForm;