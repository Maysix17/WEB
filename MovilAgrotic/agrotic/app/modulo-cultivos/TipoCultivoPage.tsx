import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from 'expo-router';
import type { RootStackParamList } from "@/types/General/Navegacion.types";
import MenuO from "@/components/organisms/General/MenuO";
import Boton from "@/components/atoms/Boton";
import CampoTexto from "@/components/atoms/CampoTexto";
import { registerTipoCultivo, getTipoCultivos, updateTipoCultivo, deleteTipoCultivo } from "@/services/Modulo Cultivos/tipoCultivoService";
import type { TipoCultivoData } from "@/types/Modulo Cultivos/TipoCultivo.types";
import { usePermission } from "@/contexts/PermissionContext";

const TipoCultivoPage = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tipoCultivos, setTipoCultivos] = useState<TipoCultivoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TipoCultivoData>({
    nombre: "",
    esPerenne: false,
  });

  useEffect(() => {
    loadTipoCultivos();
  }, []);

  const loadTipoCultivos = async () => {
    setLoading(true);
    try {
      // Llamada al servicio getTipoCultivos() para obtener todos los tipos de cultivo desde la API
      const data = await getTipoCultivos();
      setTipoCultivos(data || []);
    } catch (err) {
      console.error("Error loading tipo cultivos:", err);
      Alert.alert("Error", "No se pudieron cargar los tipos de cultivo");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTipoCultivos();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }

    try {
      if (editId) {
        // Llamada al servicio updateTipoCultivo() para actualizar un tipo de cultivo existente
        await updateTipoCultivo(editId, formData);
        Alert.alert("Éxito", "Tipo de cultivo actualizado correctamente");
      } else {
        // Llamada al servicio registerTipoCultivo() para crear un nuevo tipo de cultivo
        await registerTipoCultivo(formData);
        Alert.alert("Éxito", "Tipo de cultivo registrado correctamente");
      }

      setFormData({ nombre: "", esPerenne: false });
      setEditId(null);
      setIsFormVisible(false);
      loadTipoCultivos();
    } catch (error: any) {
      console.error("Error saving tipo cultivo:", error);
      Alert.alert("Error", error.response?.data?.message || "Error en la operación");
    }
  };
  const {hasPermission, isInitializing} = usePermission();


  const handleEdit = (item: TipoCultivoData) => {
    setEditId(item.id!);
    setFormData({
      nombre: item.nombre,
      esPerenne: item.esPerenne || false,
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Seguro que deseas eliminar este tipo de cultivo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // Llamada al servicio deleteTipoCultivo() para eliminar un tipo de cultivo
              await deleteTipoCultivo(id);
              Alert.alert("Éxito", "Tipo de cultivo eliminado correctamente");
              loadTipoCultivos();
            } catch (error: any) {
              console.error("Error deleting tipo cultivo:", error);
              Alert.alert("Error", error.message || "Error al eliminar el tipo de cultivo");
            }
          },
        },
      ]
    );
  };

  const renderTipoCultivoItem = ({ item }: { item: TipoCultivoData }) => {
    const nombre = item.nombre || 'Sin nombre';
    const clasificacion = item.esPerenne ? 'Perenne' : 'Transitorio';

    return (
      <View style={styles.tipoCultivoCard}>
        <View style={styles.tipoCultivoHeader}>
          <Text style={styles.tipoCultivoTitle}>{nombre}</Text>
          <Text style={styles.tipoCultivoClasificacion}>{clasificacion}</Text>
        </View>

        <View style={styles.tipoCultivoActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>

          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id!)}
          >
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuOpen(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tipos de Cultivo</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditId(null);
            setFormData({ nombre: "", esPerenne: false });
            setIsFormVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
        {/* Formulario */}
        {isFormVisible && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {editId ? "Editar Tipo de Cultivo" : "Registrar Tipo de Cultivo"}
            </Text>

            <CampoTexto
              etiqueta="Nombre"
              marcador="Ingrese el nombre del tipo de cultivo"
              valor={formData.nombre}
              alCambiar={(text) => setFormData({ ...formData, nombre: text })}
            />

            <Text style={styles.radioLabel}>Clasificación del Cultivo</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setFormData({ ...formData, esPerenne: true })}
              >
                <View style={[styles.radioButton, formData.esPerenne === true && styles.radioButtonSelected]} />
                <Text style={styles.radioText}>
                  Perenne - Cultivos que viven más de una temporada (árboles frutales, café, etc.)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setFormData({ ...formData, esPerenne: false })}
              >
                <View style={[styles.radioButton, formData.esPerenne === false && styles.radioButtonSelected]} />
                <Text style={styles.radioText}>
                  Transitorio - Cultivos que completan su ciclo en una temporada (maíz, arroz, etc.)
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formActions}>
              <Boton
                label="Cancelar"
                onClick={() => setIsFormVisible(false)}
                variant="light"
                color="secondary"
              />
              <Boton
                label={editId ? "Actualizar" : "Registrar"}
                onClick={handleSubmit}
                variant="solid"
                color="success"
              />
            </View>
          </View>
        )}

        {/* Lista de Tipos de Cultivo */}
        <View style={styles.tipoCultivosContainer}>
          <Text style={styles.sectionTitle}>Tipos de Cultivo ({tipoCultivos.length})</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#22c55e" />
              <Text style={styles.loadingText}>Cargando tipos de cultivo...</Text>
            </View>
          ) : tipoCultivos.length === 0 ? (
            <Text style={styles.emptyText}>No se encontraron tipos de cultivo</Text>
          ) : (
            <View style={styles.tipoCultivosList}>
              {tipoCultivos.map((item) => (
                <View key={item.id}>
                  {renderTipoCultivoItem({ item })}
                </View>
              ))}
            </View>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Menú lateral */}
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
  },
  menuIcon: {
    fontSize: 20,
    color: "#ffffff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  addButton: {
    padding: 8,
    backgroundColor: "#22c55e",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  radioContainer: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingVertical: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 12,
    marginTop: 2,
  },
  radioButtonSelected: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  radioText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
  },
  tipoCultivosContainer: {
    flex: 1,
  },
  tipoCultivosList: {
    flex: 1,
  },
  tipoCultivoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipoCultivoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tipoCultivoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  tipoCultivoClasificacion: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  tipoCultivoActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#3b82f6",
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6b7280",
    padding: 20,
  },
});

export default TipoCultivoPage;