import React from 'react';
import { ScrollView, StyleSheet, View, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import LoginO from '@/components/organisms/Modulo Usuarios/LoginO';
const logo = require("@/assets/AgroTic.png");

export default function Index() {
  const router = useRouter();

  const handleGoToRegistro = () => {
    router.push('/modulo-usuarios/RegistroPage');
  };

  const handleRecoverPassword = () => {
    router.push('/modulo-usuarios/RecuperarPage');
  };

  const handleLoginSuccess = () => {
    router.push('/modulo-inicio/dashboard');
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
            <LoginO
              onGoToRegistro={handleGoToRegistro}
              onRecoverPassword={handleRecoverPassword}
              onLoginSuccess={handleLoginSuccess}
            />
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
    width: 150,
    height: 150,
    marginBottom: 1,
  }
});