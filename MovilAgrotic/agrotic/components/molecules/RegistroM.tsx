import React from "react";
import { View, Text, StyleSheet } from "react-native"; 
import CampoTexto from "../atoms/CampoTexto"; 
import type { RegistroProps } from "../../types/Modulo Usuarios/Registro.type";
import type { RegistroErrores } from "../../types/Modulo Usuarios/RegistroError.types";

const RegistroCampos: React.FC<RegistroProps & { errores?: RegistroErrores }> = ({
    nombres, setNombres,
    apellidos, setApellidos,
    dni, setDni,
    telefono, setTelefono,
    email, setEmail,
    password, setPassword,
    errores = {}
}) => {
    return (
        // Contenedor principal
        <View style={styles.container}>
            
            {/* Campo Nombres */}
            {nombres !== undefined && setNombres && (
                <View style={styles.inputWrapper}>
                    <CampoTexto
                        etiqueta="Nombres"
                        valor={nombres}
                        //  CAMBIO: alCambiar en RN recibe el texto (string) directamente
                        alCambiar={setNombres} 
                        marcador="Ingrese un nombre"
                    />
                    {/* Texto de error */}
                    {errores.nombres && <Text style={styles.errorText}>{errores.nombres}</Text>}
                </View>
            )}

            {/* Campo Apellidos */}
            {apellidos !== undefined && setApellidos && (
                <View style={styles.inputWrapper}>
                    <CampoTexto
                        etiqueta="Apellidos"
                        valor={apellidos}
                        alCambiar={setApellidos}
                        marcador="Ingrese un apellido"
                    />
                    {errores.apellidos && <Text style={styles.errorText}>{errores.apellidos}</Text>}
                </View>
            )}

            {/* Campo DNI */}
            {dni !== undefined && setDni && (
                <View style={styles.inputWrapper}>
                    <CampoTexto
                        etiqueta="N. Documento"
                        valor={dni}
                        alCambiar={setDni}
                        marcador="Ingrese N. Documento"
                        tipo="number" // Añadido para el teclado de RN
                    />
                    {errores.dni && <Text style={styles.errorText}>{errores.dni}</Text>}
                </View>
            )}

            {/* Campo Teléfono */}
            {telefono !== undefined && setTelefono && (
                <View style={styles.inputWrapper}>
                    <CampoTexto
                        etiqueta="Teléfono"
                        valor={telefono}
                        alCambiar={setTelefono}
                        marcador="Ingrese un teléfono"
                        tipo="number" // Añadido para el teclado de RN
                    />
                    {errores.telefono && <Text style={styles.errorText}>{errores.telefono}</Text>}
                </View>
            )}

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
                    {errores.email && <Text style={styles.errorText}>{errores.email}</Text>}
                </View>
            )}

            {/* Campo Contraseña */}
            {password !== undefined && setPassword && (
                <View style={styles.inputWrapper}>
                    <CampoTexto
                        etiqueta="Contraseña"
                        tipo="password"
                        valor={password}
                        alCambiar={setPassword}
                        marcador="Ingrese contraseña"
                    />
                    {errores.password && <Text style={styles.errorText}>{errores.password}</Text>}
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
    // Equivalente a: text-red-500 text-sm mt-1
    errorText: {
        color: '#ef4444', // red-500
        fontSize: 14,     // text-sm
        marginTop: 4,     // mt-1
    },
});

export default RegistroCampos; 