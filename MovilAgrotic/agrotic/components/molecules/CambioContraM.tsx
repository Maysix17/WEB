import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CampoTexto from "../atoms/CampoTexto";
import type { ResetPasswordProps } from "../../types/Modulo Usuarios/CambioContra.types";

interface CambioContraCamposProps extends ResetPasswordProps {
    errors?: {
        newPassword?: string;
        confirmPassword?: string;
    };
}

const CambioContraCampos: React.FC<CambioContraCamposProps> = ({
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    errors = {},
}) => {
    return (
        // Contenedor principal
        <View style={styles.container}>

            {/* Campo Nueva Contraseña */}
            {newPassword !== undefined && setNewPassword && (
                <View style={styles.inputWrapper}>
                    <CampoTexto
                        etiqueta="Nueva Contraseña"
                        tipo="password"
                        valor={newPassword}
                        alCambiar={setNewPassword}
                        marcador="Ingrese nueva contraseña"
                    />
                    {errors.newPassword && (
                        <Text style={styles.errorText}>{errors.newPassword}</Text>
                    )}
                </View>
            )}

            {/* Campo Confirmar Contraseña */}
            {confirmPassword !== undefined && setConfirmPassword && (
                <View style={styles.inputWrapper}>
                    <CampoTexto
                        etiqueta="Confirmar Contraseña"
                        tipo="password"
                        valor={confirmPassword}
                        alCambiar={setConfirmPassword}
                        marcador="Confirme la nueva contraseña"
                    />
                    {errors.confirmPassword && (
                        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    )}
                </View>
            )}
        </View>
    );
};

// --- Estilos Nativos de React Native ---
const styles = StyleSheet.create({
    // Equivalente a: flex flex-col gap-2 w-full max-w-sm mx-auto
    container: {
        flexDirection: 'column',
        gap: 8, // gap-2 (asumiendo 1 unidad de Tailwind es 4px)
        width: '100%',
        maxWidth: 384, // max-w-sm (24rem)
        alignSelf: 'center', // mx-auto
        padding: 16, // Añadido un padding para que no esté pegado
    },
    // Estilo para envolver cada input (era el <div> en la versión web)
    inputWrapper: {
        width: '100%',
    },
    errorText: {
        color: '#ef4444', // red-500
        fontSize: 14,
        marginTop: 4,
    },
});

export default CambioContraCampos;