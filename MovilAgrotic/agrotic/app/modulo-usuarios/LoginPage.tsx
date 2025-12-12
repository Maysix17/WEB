import React, { useState, useEffect } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View, Image, Dimensions, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';

import LoginForm from "@/components/organisms/Modulo Usuarios/LoginO";
import RecuperarForm from "@/components/organisms/Modulo Usuarios/RecuperarO";
import CambioContraForm from "@/components/organisms/Modulo Usuarios/CambioContraO";

const logo = require("@/assets/AgroTic.png");

const LoginPage = () => {
    const router = useRouter();
    const { showRecoverModal, showChangePasswordModal, token } = useLocalSearchParams();
    const [recoverModalVisible, setRecoverModalVisible] = useState(false);
    const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);

    useEffect(() => {
        if (showRecoverModal === 'true') {
            setRecoverModalVisible(true);
        }
        if (showChangePasswordModal === 'true') {
            setChangePasswordModalVisible(true);
        }
    }, [showRecoverModal, showChangePasswordModal]);

    const goToRegistro = () => {
        router.push('/modulo-usuarios/RegistroPage');
    };

    const goToRecuperar = () => {
        setRecoverModalVisible(true);
    };

    const goToDashboard = () => {
        router.push('/modulo-inicio/dashboard');
    };

    return (
        <>
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
                            <LoginForm
                                onGoToRegistro={goToRegistro}
                                onRecoverPassword={goToRecuperar}
                                onLoginSuccess={goToDashboard}
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

            <Modal
                visible={recoverModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setRecoverModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <RecuperarForm onGoToLogin={() => setRecoverModalVisible(false)} />
                    </View>
                </View>
            </Modal>

            <Modal
                visible={changePasswordModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setChangePasswordModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <CambioContraForm token={token as string} onSuccess={() => setChangePasswordModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </>
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    }
});

export default LoginPage;