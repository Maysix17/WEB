import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import ResetPasswordCampos from "../../molecules/CambioContraM";
import CustomButton from "../../atoms/Boton";
import CustomAlertModal from "../../molecules/CustomAlertModal";
import { resetPassword } from "@/services/Modulo Usuarios/RecuperarContra";

interface ResetPasswordFormProps {
    token: string;
    onSuccess: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, onSuccess }) => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertButtons, setAlertButtons] = useState<any[]>([]);

    const validar = () => {
        if (!newPassword.trim()) {
            showAlert("Error", "La nueva contraseña es obligatoria");
            return false;
        }
        if (newPassword.length < 6) {
            showAlert("Error", "La contraseña debe tener al menos 6 caracteres");
            return false;
        }
        if (!confirmPassword.trim()) {
            showAlert("Error", "La confirmación de contraseña es obligatoria");
            return false;
        }
        if (newPassword !== confirmPassword) {
            showAlert("Error", "Las contraseñas no coinciden");
            return false;
        }
        return true;
    };

    const showAlert = (title: string, message: string, buttons?: any[]) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertButtons(buttons || [{ text: 'OK', onPress: () => setAlertVisible(false) }]);
        setAlertVisible(true);
    };

    const handleSubmit = async () => {
        if (!validar()) return;

        try {
            const response = await resetPassword(token, newPassword, confirmPassword);
            console.log("Reset password successful:", response);
            showAlert("¡Éxito!", "La contraseña se cambió correctamente", [
                { text: "OK", onPress: () => { setAlertVisible(false); onSuccess(); } }
            ]);
        } catch (error: any) {
            console.error("Reset password error:", error);
            const message = error.response?.data?.message || "Error al cambiar la contraseña";
            showAlert("Error", message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Restablecer Contraseña</Text>

            <ResetPasswordCampos
                newPassword={newPassword} setNewPassword={setNewPassword}
                confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
            />

            <View style={styles.buttonWrapper}>
                <CustomButton text="Confirmar" onClick={handleSubmit} />
            </View>

            <CustomAlertModal
                isVisible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                buttons={alertButtons}
                onBackdropPress={() => setAlertVisible(false)}
            />
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
});

export default ResetPasswordForm;