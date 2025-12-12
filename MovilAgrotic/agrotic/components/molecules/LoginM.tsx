import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"; 
import CampoTexto from "../atoms/CampoTexto"; 
import type { LoginProps } from "@/types/Modulo Usuarios/Login.type"; 
import type { RegistroErrores } from "../../types/Modulo Usuarios/RegistroError.types";
// No navigation hooks needed - functions passed as props
//  IMPORTAR EL TIPO DE NAVEGACIÓN EXTERNO Y CENTRALIZADO
import type { RootStackParamList } from '../../types/General/Navegacion.types'; 

const Login: React.FC<LoginProps & { errores?: RegistroErrores }> = React.memo(({
    dni, setDni,
    password, setPassword,
    errores = {},
}) => {

    return (
        <View style={styles.container}> 
            
            {/* Campo DNI */}
            {dni !== undefined && setDni && (
                <View style={styles.inputWrapper}>
                    <CampoTexto
                        etiqueta="N. Documento"
                        valor={dni}
                        alCambiar={setDni}
                        marcador="Ingrese N. Documento"
                    />
                    {errores.dni && <Text style={styles.errorText}>{errores.dni}</Text>}
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
});

Login.displayName = 'Login';

// --- Estilos Nativos de React Native ---
const styles = StyleSheet.create({

    container: {
        flexDirection: 'column',
        // Asegura un buen espacio entre DNI y Contraseña
        gap: 8,
        width: '100%',
        maxWidth: 384,
        alignSelf: 'center',
        padding: 16,
    },
    inputWrapper: {
        width: '100%',
    },
    errorText: {
        color: '#ef4444', 
        fontSize: 14, 
        marginTop: 4, 
    },
    // Estilos para el enlace de Recuperar Contraseña
    recoverLinkWrapper: {
        // Ajustado para estar justo debajo del input de contraseña
        marginTop: -10, 
        marginBottom: 10, 
        alignSelf: 'flex-end', // Alineado a la derecha
        padding: 5,
    },
    recoverLinkText: {
        fontSize: 14,
        color: '#1d4ed8', 
        textDecorationLine: 'underline',
    },
    // Los estilos de registro que estaban en la molécula original (los dejamos, aunque no se usen aquí)
    registroLinkWrapper: {
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    registroLinkText: {
        color: '#2563eb', 
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

export default Login;