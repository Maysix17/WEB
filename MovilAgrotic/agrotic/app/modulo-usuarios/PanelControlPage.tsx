import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import MenuO from "@/components/organisms/General/MenuO";
import CampoTexto from "@/components/atoms/CampoTexto";
import Boton from "@/components/atoms/Boton";
import CustomAlertModal from "@/components/molecules/CustomAlertModal";
import userSearchService from "@/services/Modulo Usuarios/userSearchService";
import type { Usuario } from "@/types/Modulo Usuarios/Usuarios.types";

const PanelControlPage = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<any[]>([]);

  const getBadgeStyle = (rol: string) => {
    switch (rol) {
      case 'APRENDIZ':
        return styles.badgeAprendiz;
      case 'INSTRUCTOR':
        return styles.badgeInstructor;
      case 'PASANTE':
        return styles.badgePasante;
      case 'ADMIN':
        return styles.badgeAdmin;
      default:
        return styles.badgeDefault;
    }
  };

  const getBadgeText = (rol: string) => {
    switch (rol) {
      case 'APRENDIZ':
        return 'Aprendiz';
      case 'INSTRUCTOR':
        return 'Instructor';
      case 'PASANTE':
        return 'Pasante';
      case 'ADMIN':
        return 'Admin';
      default:
        return rol;
    }
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      setAlertTitle('Error');
      setAlertMessage('Por favor ingrese un término de búsqueda');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const searchResults = await userSearchService.search(searchInput.trim());
      setResults(searchResults.data || []);
    } catch (err: any) {
      console.error('Error searching users:', err);
      setError('Error al buscar usuarios');
      setAlertTitle('Error');
      setAlertMessage('No se pudieron buscar los usuarios');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    router.push('/modulo-usuarios/RegistroPage');
  };

  const renderUserItem = ({ item }: { item: Usuario }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <Text style={styles.userName}>
          {item.nombres} {item.apellidos}
        </Text>
        <View style={[styles.badge, getBadgeStyle(item.rol?.nombre || '')]}>
          <Text style={styles.badgeText}>
            {getBadgeText(item.rol?.nombre || '')}
          </Text>
        </View>
      </View>
      <View style={styles.userDetails}>
        <Text style={styles.userInfo}>DNI: {item.dni}</Text>
        <Text style={styles.userInfo}>Correo: {item.correo}</Text>
        {item.ficha && (
          <Text style={styles.userInfo}>Ficha: {item.ficha.numero}</Text>
        )}
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // TODO: Implement edit user
            Alert.alert('Editar', 'Funcionalidad de edición próximamente');
          }}
        >
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            // TODO: Implement delete user
            Alert.alert('Eliminar', 'Funcionalidad de eliminación próximamente');
          }}
        >
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuOpen(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Panel de Control</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.panelContainer}>
          <Text style={styles.title}>Gestión de Usuarios</Text>
          <Text style={styles.subtitle}>Buscar y administrar usuarios del sistema</Text>

          <View style={styles.searchContainer}>
            <CampoTexto
              etiqueta="Buscar usuario (nombre, apellido, DNI)"
              marcador="Ingrese el término de búsqueda..."
              valor={searchInput}
              alCambiar={setSearchInput}
              onSubmitEditing={handleSearch}
            />
            <View style={styles.searchButton}>
              <Boton text="Buscar" onClick={handleSearch} />
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Boton
              text="Crear Usuario"
              onClick={handleCreateUser}
              variant="solid"
              color="primary"
            />
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#22c55e" />
              <Text style={styles.loadingText}>Buscando usuarios...</Text>
            </View>
          )}

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {!loading && !error && results.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.sectionTitle}>Resultados ({results.length})</Text>
              <FlatList
                data={results}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {!loading && !error && results.length === 0 && searchInput && (
            <Text style={styles.emptyText}>No se encontraron usuarios</Text>
          )}
        </View>
      </ScrollView>

      <MenuO isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <CustomAlertModal
        isVisible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onBackdropPress={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

  



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
    paddingVertical: 12,
    paddingTop: 45,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  menuButton: {
    padding: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    marginLeft: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: "#374151",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  panelContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchButton: {
    marginTop: 10,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  resultsContainer: {
    minHeight: 200,
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeAprendiz: {
    backgroundColor: "#3b82f6",
  },
  badgeInstructor: {
    backgroundColor: "#066839",
  },
  badgePasante: {
    backgroundColor: "#eab308",
  },
  badgeDefault: {
    backgroundColor: "#6b7280",
  },
  badgeAdmin: {
    backgroundColor: "#dc2626",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  actionButton: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  userDetails: {
    marginBottom: 12,
  },
  userInfo: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  userActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: "#ef4444",
    padding: 20,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6b7280",
    padding: 20,
  },
});

export default PanelControlPage;