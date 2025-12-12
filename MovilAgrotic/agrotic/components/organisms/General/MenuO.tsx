import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useIsAuthenticated, usePermissions } from "@/hooks/usePermissionSelectors";

const { width } = Dimensions.get("window");

interface MenuOProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuO: React.FC<MenuOProps> = React.memo(({ isOpen, onClose }) => {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-width * 0.7)).current;
  const isAuthenticated = useIsAuthenticated();
  const permissions = usePermissions();

  const mainModules = [
    { nombre: "Inicio", modulo: "Inicio" },
    { nombre: "zonas", modulo: "zonas" },
    { nombre: "IOT", modulo: "IOT" },
    { nombre: "Cultivos", modulo: "Cultivos" },
    { nombre: "Actividades", modulo: "Actividades" },
    { nombre: "Inventario", modulo: "Inventario" },
    { nombre: "Usuarios", modulo: "Usuarios" },
  ];

  const getRoute = (label: string) => {
    switch (label) {
      case "Inicio":
        return "Dashboard";
      case "zonas":
        return "Zonas";
      case "IOT":
        return "IOT";
      case "Cultivos":
        return "Cultivos";
      case "Actividades":
        return "Actividades";
      case "Inventario":
        return "Inventario";
      default:
        return "Dashboard";
    }
  };

  // Filter modules based on user permissions
  const filteredModules = isAuthenticated ? mainModules.filter(module => {
    // Check if user has access to this module
    const moduleNameMap = {
      'Inicio': 'Inicio',
      'zonas': 'zonas',
      'IOT': 'IoT',
      'Cultivos': 'Cultivos',
      'Actividades': 'Actividades',
      'Inventario': 'Inventario',
      'Usuarios': 'Usuarios'
    };

    const mappedModuleName = moduleNameMap[module.modulo as keyof typeof moduleNameMap] || module.modulo;

    const hasAccess = permissions.some(p =>
      p.modulo === mappedModuleName &&
      p.recurso.startsWith('acceso_') &&
      p.accion === 'ver'
    );

    // Special case for Usuarios module - check panel_de_control permission
    if (module.modulo === 'Usuarios') {
      return permissions.some(p =>
        p.modulo === 'Usuarios' &&
        p.recurso === 'panel_de_control' &&
        p.accion === 'leer'
      );
    }

    return hasAccess;
  }) : [];

  console.log('MenuO: isAuthenticated:', isAuthenticated, 'permissions count:', permissions.length, 'filteredModules:', filteredModules.length);

  const priorityOrder = ["Inicio", "zonas", "IOT", "Cultivos", "Actividades", "Inventario", "Usuarios"];
  const sortedFilteredModules = [...filteredModules].sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.nombre);
    const bIndex = priorityOrder.indexOf(b.nombre);
    return aIndex - bIndex;
  });

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -width * 0.7,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen, slideAnim]);

  const handleNavigation = useCallback((route: string) => {
    // Navegar a las rutas reales de la app móvil usando Expo Router
    if (route === "Cultivos") {
      router.push("/modulo-cultivos/CultivosPage");
    } else if (route === "Zonas") {
      router.push("/modulo-zonas/ZonasPage");
    } else if (route === "Actividades") {
      router.push("/modulo-actividades/ActividadesPage");
    } else if (route === "Historial de Actividades") {
      router.push("/modulo-actividades/HistorialActividadesPage");
    } else if (route === "Inventario") {
      router.push("/modulo-inventario/InventarioPage");
    } else if (route === "IOT") {
      router.push("/modulo-iot/IOTPage");
    } else {
      router.push("/modulo-inicio/dashboard");
    }
    onClose();
  }, [router, onClose]);

  const handleUserProfile = useCallback(() => {
    // Always navigate to ProfilePage for all authenticated users
    router.push("/modulo-usuarios/ProfilePage");
    onClose();
  }, [router, onClose]);

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando permisos...</Text>
      </View>
    );
  }

  return (
    <Modal visible={isOpen} transparent animationType="none">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />

        <Animated.View
          style={[
            styles.menuContainer,
            { transform: [{ translateX: slideAnim }] },
            isOpen && styles.menuFullScreen,
          ]}
        >
          {/* Logo principal */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/AgroTic.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Botones del menú */}
          <View style={styles.menuItems}>
            {sortedFilteredModules
              .filter(module => module.nombre !== "Usuarios") // Exclude Usuarios since we have Profile
              .map((module) => {
              let label = module.nombre;
              if (module.nombre === "zonas") {
                label = "Zonas";
              } else if (module.nombre === "TipoCultivo") {
                label = "Tipo de Cultivo";
              } else if (module.nombre === "Variedad") {
                label = "Variedades";
              }

              return (
                <TouchableOpacity
                  key={module.nombre}
                  style={styles.menuButton}
                  onPress={() => handleNavigation(getRoute(module.nombre))}
                >
                  <Text style={styles.menuText}>{label}</Text>
                </TouchableOpacity>
              );
            })}

            {/* Profile button - always visible for authenticated users, placed after Inventario */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleUserProfile}
            >
              <Text style={styles.menuText}>Perfil</Text>
            </TouchableOpacity>
          </View>

          {/* Logo secundario */}
          <View style={styles.secondaryLogoContainer}>
            <Image
              source={require("../../../assets/logoSena.png")}
              style={styles.secondaryLogo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

MenuO.displayName = 'MenuO';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flexDirection: "row",
  },
  overlayTouchable: {
    flex: 1,
  },
  menuContainer: {
    width: width * 0.7,
    backgroundColor: "#f9fafb", // Similar to bg-gray-50
    padding: 16,
    justifyContent: "flex-start", // Changed from space-between to flex-start
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  menuFullScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%", // Cover full screen height
    width: width * 0.7, // Keep the same width
  },
  submenuContainer: {
    marginLeft: 16,
    marginTop: 8,
  },
  submenuButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 2,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  submenuText: {
    fontSize: 14,
    color: "#6b7280",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "bold",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 150,
    height: 100,
  },
  menuItems: {
    flex: 1,
  },
  menuButton: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  secondaryLogoContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  secondaryLogo: {
    width: 100,
    height: 75,
  },
});

export default MenuO;