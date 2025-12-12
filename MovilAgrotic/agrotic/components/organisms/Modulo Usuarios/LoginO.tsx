import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LoginCampos from "../../molecules/LoginM";
import CustomButton from "../../atoms/Boton";
import CustomAlertModal from "../../molecules/CustomAlertModal";
import type { RegistroErrores } from "@/types/Modulo Usuarios/RegistroError.types";
import { usePermission } from "@/contexts/PermissionContext";
import type { LoginPayload } from "@/types/Modulo Usuarios/auth";

interface LoginFormProps {
    onGoToRegistro: () => void;
    onRecoverPassword: () => void;
    onLoginSuccess: () => void;
}

// 2. APLICAMOS LA INTERFAZ Y RECIBIMOS AMBAS PROPS
const LoginForm: React.FC<LoginFormProps> = ({ onGoToRegistro, onRecoverPassword, onLoginSuccess }) => {
    const { login } = usePermission();
    const [dni, setDni] = useState("");
    const [password, setPassword] = useState("");
    const [errores, setErrores] = useState<RegistroErrores>({});
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertButtons, setAlertButtons] = useState<any[]>([]);

    const validar = () => {
        const nuevoErrores: RegistroErrores = {};
        if (!dni.trim()) nuevoErrores.dni = "El DNI es obligatorio";
        if (!password.trim()) nuevoErrores.password = "La contraseña es obligatoria";
        setErrores(nuevoErrores);
        return Object.keys(nuevoErrores).length === 0;
    };

    const handleSubmit = async () => {
        if (!validar()) {
            return;
        }
        try {
            const loginData: LoginPayload = {
                dni: parseInt(dni),
                password,
            };
            await login(loginData);
            console.log("Login successful");
            // Navigate to Dashboard
            onLoginSuccess();
        } catch (error: any) {
            console.error("Login error:", error);
            const message = error.response?.data?.message || "Error al iniciar sesión";
            setAlertTitle("Error");
            setAlertMessage(message);
            setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
            setAlertVisible(true);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Inicia Sesión</Text>

            <LoginCampos
                dni={dni} setDni={setDni}
                password={password} setPassword={setPassword}
                errores={errores}
            />

            <View style={styles.buttonWrapper}>
                <CustomButton text="Iniciar Sesión" onClick={handleSubmit} size="lg" />
            </View>

            {/* AGRUPAMOS AMBOS ENLACES EN UN SOLO CONTENEDOR */}
            <View style={styles.linksWrapper}>

                {/* Enlace 1: Recuperar Contraseña */}
                <TouchableOpacity onPress={onRecoverPassword} style={styles.linkWrapper}>
                    <Text style={styles.linkText}>
                        ¿Olvidaste tu contraseña? <Text style={styles.linkTextStrong}>Recupérala aquí.</Text>
                    </Text>
                </TouchableOpacity>

                {/* Enlace 2: Registrarse */}
                <TouchableOpacity onPress={onGoToRegistro} style={styles.linkWrapper}>
                    <Text style={styles.linkText}>
                        ¿No tienes cuenta? <Text style={styles.linkTextStrong}>Regístrate aquí.</Text>
                    </Text>
                </TouchableOpacity>

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
        padding: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 24,
        textAlign: 'center',
        color: '#1f2937',
        letterSpacing: 0.5,
    },
    buttonWrapper: {
        marginTop: 6,
        width: '100%',
    },
    // NUEVO: Contenedor para agrupar los dos enlaces (Registro y Recuperar)
    linksWrapper: {
        marginTop: 24,
        alignItems: 'center',
    },
    // Estilos reutilizados para ambos enlaces
    linkWrapper: {
        marginTop: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    linkText: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
    },
    linkTextStrong: {
        color: '#3b82f6',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default LoginForm;