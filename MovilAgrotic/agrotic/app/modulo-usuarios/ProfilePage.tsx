import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    Platform,
    SafeAreaView,
} from "react-native";
import Boton from "../../components/atoms/Boton";
import MenuO from "@/components/organisms/General/MenuO";
import { permissionsService } from "@/services/General/permissionsService";
import { getProfile, Profile } from "@/services/Modulo Usuarios/profileService";
import { logoutUser } from "@/services/Modulo Usuarios/authService";

const ProfilePage = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);
  const handleLogout = async () => {
   try {
     // Llamada al servicio logoutUser() para cerrar la sesión del usuario
     await logoutUser();
     router.push('/');
   } catch (error) {
     console.error('Error al cerrar sesión:', error);
   }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Llamada al servicio getProfile() para obtener los datos del perfil del usuario desde la API
      const profileData = await getProfile();
      setUser(profileData);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || "Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsMenuOpen(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
        <MenuO isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsMenuOpen(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || "No se pudo cargar el perfil"}</Text>
          <Boton text="Reintentar" onClick={fetchProfile} />
        </View>
        <MenuO isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuOpen(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileContainer}>
          <Text style={styles.title}>Datos del Usuario</Text>
          <Text style={styles.subtitle}>Información básica</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Nombre</Text>
              <Text style={styles.infoValue}>{user.nombres}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Apellidos</Text>
              <Text style={styles.infoValue}>{user.apellidos}</Text>
            </View>

            <View style={styles.infoCardFull}>
              <Text style={styles.infoLabel}>Documento de Identidad</Text>
              <Text style={styles.infoValue}>{user.dni}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Correo</Text>
              <Text style={styles.infoValue}>{user.correo}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{user.telefono}</Text>
            </View>

            {user.ficha && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>ID Ficha</Text>
                <Text style={styles.infoValue}>{user.ficha.numero}</Text>
              </View>
            )}

            <View style={styles.infoCardFull}>
              <Text style={styles.infoLabel}>Rol</Text>
              <Text style={styles.infoValue}>{user.rol.nombre}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      <MenuO isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#066839",
    paddingHorizontal: 16,
    height: Dimensions.get('window').height * 0.1,
    paddingTop: Platform.OS === 'ios' ? 45 : 20,
    shadowColor: "#e2e8f0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: "#ffffff",
  },
  headerRight: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  infoGrid: {
    gap:8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
  },
  infoCardFull: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  actionsContainer: {
    marginTop: 32,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#9f0202",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfilePage;