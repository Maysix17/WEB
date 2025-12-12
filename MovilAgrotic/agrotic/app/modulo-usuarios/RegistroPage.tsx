// src/pages/RegistroPage.tsx
import React from "react";
// 💡 Importamos ScrollView y View
import { ScrollView, StyleSheet, View, Image, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import RegistroForm from "@/components/organisms/Modulo Usuarios/RegistroO";
const logo = require("@/assets/AgroTic.png");

const RegistroPage = () => {
    const router = useRouter();

    const goToLogin = () => {
        router.push('/');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* ✅ RESTAURAMOS EL SCROLLVIEW */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>

                    <View style={styles.contentWrapper}>

                        <Image
                            source={logo}
                            style={styles.logo}
                            resizeMode="contain"
                        />

                        <RegistroForm onGoToLogin={goToLogin} />

                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// --- Estilos Nativos de React Native ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    //  ESTILO CLAVE: Permite el crecimiento y centra el contenido.
    //    Si el contenido es más largo que la pantalla, permite el scroll.
    scrollViewContent: {
        flexGrow: 1, // Permite que el contenido ocupe todo el espacio disponible
        justifyContent: 'center', // Centra verticalmente si el contenido cabe
        alignItems: 'center',
        paddingVertical: 30, // Margen vertical generoso para el scroll
    },
    contentWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    // Logo grande (ya no hay restricciones de espacio)
    logo: {
        width: 200, 
        height: 200,
        marginBottom: 1, 
    }
});

export default RegistroPage;