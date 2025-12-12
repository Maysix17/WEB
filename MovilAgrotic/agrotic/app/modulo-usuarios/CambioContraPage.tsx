// src/pages/ResetPasswordPage.tsx
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View, Image, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';

import CambioContraForm from "@/components/organisms/Modulo Usuarios/CambioContraO";
import type { RootStackParamList } from '@/types/General/Navegacion.types';
const logo = require("@/assets/AgroTic.png");

// Tipado de la prop de navegación para esta pantalla
const CambioContraPage = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { token } = params as { token: string };

    const goToLogin = () => {
        router.push('/');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
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
                        <CambioContraForm token={token} onSuccess={goToLogin} />
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
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 30,
    },
    contentWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 1,
    }
});

export default CambioContraPage;