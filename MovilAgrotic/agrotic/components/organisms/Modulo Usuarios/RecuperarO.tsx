import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import RecuperarCampos from "../../molecules/RecuperarM";
import CustomButton from "../../atoms/Boton";
import CustomAlertModal from "../../molecules/CustomAlertModal";
import { recoverPassword } from "@/services/Modulo Usuarios/RecuperarContra";

interface RecuperarFormProps {
    onGoToLogin: () => void;
}

const RecuperarForm: React.FC<RecuperarFormProps> = ({ onGoToLogin }) => {
    const [email, setEmail] = useState("");
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertButtons, setAlertButtons] = useState<any[]>([]);

    const validar = () => {
        if (!email.trim()) {
            showAlert("Error", "El correo electrónico es obligatorio");
            return false;
        }
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert("Error", "Por favor ingrese un correo electrónico válido");
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
            const response = await recoverPassword(email);
            console.log("Forgot password successful:", response);
            showAlert("¡Éxito!", "Se ha enviado un enlace de recuperación a tu correo electrónico");

            setEmail("");
        } catch (error: any) {
            console.error("Forgot password error:", error);
            const message = error.response?.data?.message || "Error al enviar el correo de recuperación";
            showAlert("Error", message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recuperar Contraseña</Text>

            <RecuperarCampos
                email={email} setEmail={setEmail}
            />

            <View style={styles.buttonWrapper}>
                <CustomButton text="Enviar" onClick={handleSubmit} />
            </View>

            {/* Enlace para volver al login */}
            <Text style={styles.linkText} onPress={onGoToLogin}>
                ¿Recordaste tu contraseña? <Text style={styles.linkTextStrong}>Inicia sesión aquí.</Text>
            </Text>

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
        marginTop: 2,
    },
    linkText: {
        fontSize: 14,
        color: '#4b5563',
        textAlign: 'center',
        marginTop: 15,
    },
    linkTextStrong: {
        color: '#1d4ed8',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    }
});

export default RecuperarForm;