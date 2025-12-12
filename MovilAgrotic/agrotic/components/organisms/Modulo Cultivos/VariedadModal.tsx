import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import CampoTexto from "../../atoms/CampoTexto";
import Boton from "../../atoms/Boton";
import CustomAlertModal from "../../molecules/CustomAlertModal";
import { registerVariedad, getVariedades, updateVariedad, deleteVariedad } from "../../../services/Modulo Cultivos/variedadService";
import { getTipoCultivos } from "../../../services/Modulo Cultivos/tipoCultivoService";
import type { VariedadData } from "../../../types/Modulo Cultivos/Variedad.types";
import type { TipoCultivoData } from "../../../types/Modulo Cultivos/TipoCultivo.types";
import { usePermission } from "@/contexts/PermissionContext";

interface VariedadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const VariedadModal: React.FC<VariedadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [variedades, setVariedades] = useState<VariedadData[]>([]);
  const [tipoCultivos, setTipoCultivos] = useState<TipoCultivoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isTipoCultivoModalVisible, setIsTipoCultivoModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<VariedadData>({
    nombre: "",
    fkTipoCultivoId: "",
  });
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [variedadesData, tiposData] = await Promise.all([
        getVariedades(),
        getTipoCultivos()
      ]);
      setVariedades(variedadesData || []);
      setTipoCultivos(tiposData || []);
    } catch (err) {
      console.error("Error loading data:", err);
      showAlert("Error", "No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (title: string, message: string, buttons?: any[]) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertButtons(buttons || [{ text: 'OK', onPress: () => setAlertVisible(false) }]);
    setAlertVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      showAlert("Error", "El nombre es obligatorio");
      return;
    }
    if (!formData.fkTipoCultivoId) {
      showAlert("Error", "Debe seleccionar un tipo de cultivo");
      return;
    }

    try {
      if (editId) {
        await updateVariedad(editId, formData);
        showAlert("Éxito", "Variedad actualizada correctamente");
      } else {
        await registerVariedad(formData);
        showAlert("Éxito", "Variedad registrada correctamente");
      }

      setFormData({ nombre: "", fkTipoCultivoId: "" });
      setEditId(null);
      setIsFormVisible(false);
      loadData();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving variedad:", error);
      showAlert("Error", error.response?.data?.message || "Error en la operación");
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
    showAlert(
      "Confirmar eliminación",
      "¿Seguro que deseas eliminar esta variedad?",
      [
        { text: "Cancelar", onPress: () => setAlertVisible(false), style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            setAlertVisible(false);
            try {
              await deleteVariedad(id);
              showAlert("Éxito", "Variedad eliminada correctamente");
              loadData();
              onSuccess?.();
            } catch (error: any) {
              console.error("Error deleting variedad:", error);
              showAlert("Error", error.message || "Error al eliminar la variedad");
            }
          },
          style: "destructive"
        },
      ]
    );
  };


  const getTipoCultivoName = (fkTipoCultivoId: string | undefined) => {
    const tipo = tipoCultivos.find(t => t.id === fkTipoCultivoId);
    return tipo?.nombre || "Sin tipo";
  };

  const {hasPermission, isInitializing, lastUpdate} = usePermission();

  const renderVariedadItem = useCallback(({ item }: { item: VariedadData }) => {
    const nombre = item.nombre || 'Sin nombre';
    const tipoCultivo = getTipoCultivoName(item.fkTipoCultivoId);

    return (
      <View style={styles.variedadCard}>
        <View style={styles.variedadHeader}>
          <Text style={styles.variedadTitle}>{nombre}</Text>
          <Text style={styles.variedadTipo}>{tipoCultivo}</Text>
        </View>

        <View style={styles.variedadActions}>
          {!isInitializing && hasPermission('Cultivos', 'cultivos', 'actualizar') && (
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
  )}

          {!isInitializing && hasPermission('Cultivos', 'cultivos', 'eliminar') && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id!)}
          >
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, [hasPermission, isInitializing, lastUpdate, handleEdit, handleDelete]);

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
    <Modal visible={isOpen} transparent={true} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Gestionar Variedades</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Botón para agregar */}
            {!isInitializing && hasPermission('Cultivos', 'cultivos', 'crear') && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setEditId(null);
                setFormData({ nombre: "", fkTipoCultivoId: "" });
                setIsFormVisible(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Agregar Variedad</Text>

            </TouchableOpacity>
            )}

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
                    onClick={() => {
                      setFormData({ nombre: "", fkTipoCultivoId: "" });
                      setEditId(null);
                      setIsFormVisible(false);
                    }}
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
        </View>
      </View>

      {/* Modal de selección de tipo de cultivo */}
      <Modal visible={isTipoCultivoModalVisible} transparent={true} animationType="fade">
        <View style={styles.selectorOverlay}>
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorTitle}>Seleccionar Tipo de Cultivo</Text>
            <ScrollView style={styles.selectorScroll}>
              {tipoCultivos.map(renderTipoCultivoOption)}
            </ScrollView>
            <TouchableOpacity
              style={styles.selectorCloseButton}
              onPress={() => setIsTipoCultivoModalVisible(false)}
            >
              <Text style={styles.selectorCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomAlertModal
        isVisible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onBackdropPress={() => setAlertVisible(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "95%",
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: "#6b7280",
  },
  content: {
    padding: 16,
  },
  addButton: {
    backgroundColor: "#066839",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  formContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
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
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  variedadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  variedadTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  variedadTipo: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  variedadActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingVertical: 6,
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
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#6b7280",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
    padding: 20,
  },
  selectorOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectorContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "80%",
    maxHeight: "60%",
    padding: 16,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  selectorScroll: {
    maxHeight: 200,
  },
  tipoOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tipoOptionText: {
    fontSize: 16,
    color: "#374151",
  },
  tipoOptionSubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  selectorCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    alignItems: "center",
  },
  selectorCloseText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
});

export default VariedadModal;