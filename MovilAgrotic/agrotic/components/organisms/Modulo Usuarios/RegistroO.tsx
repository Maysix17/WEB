import React, { useState } from "react";
//  Importamos TouchableOpacity
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import RegistroCampos from "../../molecules/RegistroM";
import CustomButton from "../../atoms/Boton";
import CustomAlertModal from "../../molecules/CustomAlertModal";
import type { RegistroErrores } from "@/types/Modulo Usuarios/RegistroError.types";
import { registerUser } from "@/services/Modulo Usuarios/authService";
import type { RegisterFormData } from "@/types/Modulo Usuarios/auth";

// INTERFAZ DEL ORGANISMO
interface RegistroFormProps {
    onGoToLogin: () => void; // Propiedad para navegar a Login
}


//  El Organismo ahora recibe la prop onGoToLogin
const RegistroForm: React.FC<RegistroFormProps> = ({ onGoToLogin }) => {
    // La lógica de estado y validación es idéntica en RN y Web
    const [nombres, setNombres] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [dni, setDni] = useState("");
    const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errores, setErrores] = useState<RegistroErrores>({});
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertButtons, setAlertButtons] = useState<any[]>([]);

    const validar = () => {
        const nuevoErrores: RegistroErrores = {};
        if (!nombres.trim()) nuevoErrores.nombres = "El nombre es obligatorio";
        if (!apellidos.trim()) nuevoErrores.apellidos = "El apellido es obligatorio";
        if (!dni.trim()) nuevoErrores.dni = "El DNI es obligatorio";
        if (!telefono.trim()) nuevoErrores.telefono = "El teléfono es obligatorio";
        if (!email.trim()) nuevoErrores.email = "El correo es obligatorio";
        if (!password.trim()) nuevoErrores.password = "La contraseña es obligatoria";

        setErrores(nuevoErrores);
        return Object.keys(nuevoErrores).length === 0;
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
            const registerData: RegisterFormData = {
                nombres,
                apellidos,
                dni,
                telefono,
                email,
                password,
            };
            const response = await registerUser(registerData);
            console.log("Register successful:", response);
            showAlert("¡Éxito!", "Usuario registrado correctamente");

            setNombres("");
            setApellidos("");
            setDni("");
            setTelefono("");
            setEmail("");
            setPassword("");
            setErrores({});
        } catch (error: any) {
            console.error("Register error:", error);
            const message = error.response?.data?.message || "Error al registrar usuario";
            showAlert("Error", message);
        }
    };

    return (
        <View style={styles.container}>

            <Text style={styles.title}>Registro de Usuario</Text>

            <RegistroCampos
                nombres={nombres} setNombres={setNombres}
                apellidos={apellidos} setApellidos={setApellidos}
                dni={dni} setDni={setDni}
                telefono={telefono} setTelefono={setTelefono}
                email={email} setEmail={setEmail}
                password={password} setPassword={setPassword}
                errores={errores}
            />

            <View style={styles.buttonWrapper}>
                <CustomButton text="Registrar" onClick={handleSubmit} size="lg" />
            </View>

            {/*  ENLACE DE NAVEGACIÓN A LOGIN */}
            <TouchableOpacity onPress={onGoToLogin} style={styles.loginLinkWrapper}>
                <Text style={styles.loginLinkText}>
                    ¿Ya tienes cuenta? <Text style={styles.loginLinkTextStrong}>Inicia sesión aquí.</Text>
                </Text>
            </TouchableOpacity>

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
        marginBottom: 8,
        textAlign: 'center',
        color: '#1f2937',
    },
    buttonWrapper: {
        marginTop: 4,
        width: '100%',
    },
    // 💡 NUEVOS ESTILOS PARA EL ENLACE DE INICIAR SESIÓN
    loginLinkWrapper: {
        marginTop: 15, // Espacio debajo del botón "Registrar"
        padding: 5,
        alignSelf: 'center'
    },
    loginLinkText: {
        fontSize: 14,
        color: '#4b5563', // Texto gris estándar
        textAlign: 'center',
    },
    loginLinkTextStrong: {
        color: '#1d4ed8', // Texto azul para la acción
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    }
});

export default RegistroForm;