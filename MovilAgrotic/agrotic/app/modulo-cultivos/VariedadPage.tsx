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
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from 'expo-router';
import type { RootStackParamList } from "@/types/General/Navegacion.types";
import MenuO from "@/components/organisms/General/MenuO";
import Boton from "@/components/atoms/Boton";
import CampoTexto from "@/components/atoms/CampoTexto";
import { registerVariedad, getVariedades, updateVariedad, deleteVariedad } from "@/services/Modulo Cultivos/variedadService";
import { getTipoCultivos } from "@/services/Modulo Cultivos/tipoCultivoService";
import type { VariedadData } from "@/types/Modulo Cultivos/Variedad.types";
import type { TipoCultivoData } from "@/types/Modulo Cultivos/TipoCultivo.types";

const VariedadPage = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [variedades, setVariedades] = useState<VariedadData[]>([]);
  const [tipoCultivos, setTipoCultivos] = useState<TipoCultivoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isTipoCultivoModalVisible, setIsTipoCultivoModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<VariedadData>({
    nombre: "",
    fkTipoCultivoId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [variedadesData, tiposData] = await Promise.all([
        // Llamada al servicio getVariedades() para obtener todas las variedades desde la API
        getVariedades(),
        // Llamada al servicio getTipoCultivos() para obtener todos los tipos de cultivo desde la API
        getTipoCultivos()
      ]);
      setVariedades(variedadesData || []);
      setTipoCultivos(tiposData || []);
    } catch (err) {
      console.error("Error loading data:", err);
      Alert.alert("Error", "No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }
    if (!formData.fkTipoCultivoId) {
      Alert.alert("Error", "Debe seleccionar un tipo de cultivo");
      return;
    }

    try {
      if (editId) {
        // Llamada al servicio updateVariedad() para actualizar una variedad existente
        await updateVariedad(editId, formData);
        Alert.alert("Éxito", "Variedad actualizada correctamente");
      } else {
        // Llamada al servicio registerVariedad() para crear una nueva variedad
        await registerVariedad(formData);
        Alert.alert("Éxito", "Variedad registrada correctamente");
      }

      setFormData({ nombre: "", fkTipoCultivoId: "" });
      setEditId(null);
      setIsFormVisible(false);
      loadData();
    } catch (error: any) {
      console.error("Error saving variedad:", error);
      Alert.alert("Error", error.response?.data?.message || "Error en la operación");
    }
  };

  const handleEdit = (item: VariedadData) => {
    setEditId(item.id!);
    setFormData({
      nombre: item.nombre,
      fkTipoCultivoId: item.fkTipoCultivoId || "",
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Seguro que deseas eliminar esta variedad?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // Llamada al servicio deleteVariedad() para eliminar una variedad
              await deleteVariedad(id);
              Alert.alert("Éxito", "Variedad eliminada correctamente");
              loadData();
            } catch (error: any) {
              console.error("Error deleting variedad:", error);
              Alert.alert("Error", error.message || "Error al eliminar la variedad");
            }
          },
        },
      ]
    );
  };

  const getTipoCultivoName = (fkTipoCultivoId: string | undefined) => {
    const tipo = tipoCultivos.find(t => t.id === fkTipoCultivoId);
    return tipo?.nombre || "Sin tipo";
  };

  const renderVariedadItem = ({ item }: { item: VariedadData }) => {
    const nombre = item.nombre || 'Sin nombre';
    const tipoCultivo = getTipoCultivoName(item.fkTipoCultivoId);

    return (
      <View style={styles.variedadCard}>
        <View style={styles.variedadHeader}>
          <Text style={styles.variedadTitle}>{nombre}</Text>
          <Text style={styles.variedadTipo}>{tipoCultivo}</Text>
        </View>

        <View style={styles.variedadActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.editButtonText}> Editar</Text>
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

  const renderTipoCultivoOption = (tipo: TipoCultivoData) => (
    <TouchableOpacity
      key={tipo.id}
      style={styles.tipoOption}
      onPress={() => {
        setFormData({ ...formData, fkTipoCultivoId: tipo.id! });
        setIsTipoCultivoModalVisible(false);
      }}
    >
      <Text style={styles.tipoOptionText}>{tipo.nombre}</Text>
      <Text style={styles.tipoOptionSubtext}>
        {tipo.esPerenne ? "Perenne" : "Transitorio"}
      </Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Variedades</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditId(null);
            setFormData({ nombre: "", fkTipoCultivoId: "" });
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
              {editId ? "Editar Variedad" : "Registrar Variedad"}
            </Text>

            <CampoTexto
              etiqueta="Nombre"
              marcador="Ingrese el nombre de la variedad"
              valor={formData.nombre}
              alCambiar={(text) => setFormData({ ...formData, nombre: text })}
            />

            <Text style={styles.label}>Tipo de Cultivo</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setIsTipoCultivoModalVisible(true)}
            >
              <Text style={styles.selectorText}>
                {formData.fkTipoCultivoId
                  ? getTipoCultivoName(formData.fkTipoCultivoId)
                  : "Seleccione un tipo de cultivo"}
              </Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>

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

        {/* Lista de Variedades */}
        <View style={styles.variedadesContainer}>
          <Text style={styles.sectionTitle}>Variedades ({variedades.length})</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#22c55e" />
              <Text style={styles.loadingText}>Cargando variedades...</Text>
            </View>
          ) : variedades.length === 0 ? (
            <Text style={styles.emptyText}>No se encontraron variedades</Text>
          ) : (
            <View style={styles.variedadesList}>
              {variedades.map((item) => (
                <View key={item.id}>
                  {renderVariedadItem({ item })}
                </View>
              ))}
            </View>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de selección de tipo de cultivo */}
      <Modal
        visible={isTipoCultivoModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsTipoCultivoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Seleccionar Tipo de Cultivo</Text>
            <ScrollView style={styles.modalScroll}>
              {tipoCultivos.map(renderTipoCultivoOption)}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsTipoCultivoModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  selector: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectorText: {
    fontSize: 16,
    color: "#374151",
  },
  selectorArrow: {
    fontSize: 12,
    color: "#6b7280",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
  },
  variedadesContainer: {
    flex: 1,
  },
  variedadesList: {
    flex: 1,
  },
  variedadCard: {
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
  variedadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  variedadTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  variedadTipo: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  variedadActions: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "90%",
    maxHeight: "70%",
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  modalScroll: {
    maxHeight: 300,
  },
  tipoOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tipoOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  tipoOptionSubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
});

export default VariedadPage;