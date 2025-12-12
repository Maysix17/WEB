import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CampoTexto from "../atoms/CampoTexto";
import type { RecuperarProps } from "@/types/Modulo Usuarios/Recuperar.types";

const RecuperarCampos: React.FC<RecuperarProps> = ({
    email, setEmail,
}) => {
    return (
        // Contenedor principal
        <View style={styles.container}>

            {/* Campo Email */}
            {email !== undefined && setEmail && (
                <View style={styles.inputWrapper}>
                    <CampoTexto
                        etiqueta="Correo electrónico"
                        tipo="email"
                        valor={email}
                        alCambiar={setEmail}
                        marcador="Ingrese correo"
                    />
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
});

export default RecuperarCampos;