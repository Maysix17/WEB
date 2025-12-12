// src/pages/RecuperarPage.tsx
import React from "react";
import { ScrollView, StyleSheet, View, Image, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import RecuperarForm from "@/components/organisms/Modulo Usuarios/RecuperarO";
const logo = require("@/assets/AgroTic.png");

const RecuperarPage = () => {
    const router = useRouter();

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

                        <RecuperarForm onGoToLogin={goToLogin} />

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
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 15,
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

export default RecuperarPage;