import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import CampoTexto from "../../atoms/CampoTexto";
import Boton from "../../atoms/Boton";
import { registerTipoCultivo, getTipoCultivos, updateTipoCultivo, deleteTipoCultivo } from "../../../services/Modulo Cultivos/tipoCultivoService";
import type { TipoCultivoData } from "../../../types/Modulo Cultivos/TipoCultivo.types";
import {usePermission} from "@/contexts/PermissionContext";

interface TipoCultivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onShowAlert?: (title: string, message: string, buttons: any[]) => void;
  onCloseAlert?: () => void;
}



const TipoCultivoModal: React.FC<TipoCultivoModalProps> = ({ isOpen, onClose, onSuccess, onShowAlert, onCloseAlert }) => {
  const [tipoCultivos, setTipoCultivos] = useState<TipoCultivoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TipoCultivoData>({
    nombre: "",
    esPerenne: false,
  });

  useEffect(() => {
    if (isOpen) {
      loadTipoCultivos();
    }
  }, [isOpen]);

  const loadTipoCultivos = async () => {
    setLoading(true);
    try {
      const data = await getTipoCultivos();
      setTipoCultivos(data || []);
    } catch (err) {
      console.error("Error loading tipo cultivos:", err);
      onShowAlert?.("Error", "No se pudieron cargar los tipos de cultivo", [{ text: 'OK', onPress: onCloseAlert }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      onShowAlert?.("Error", "El nombre es obligatorio", [{ text: 'OK', onPress: onCloseAlert }]);
      return;
    }

    try {
      if (editId) {
        await updateTipoCultivo(editId, formData);
        onShowAlert?.("Éxito", "Tipo de cultivo actualizado correctamente", [{ text: 'OK', onPress: () => { setFormData({ nombre: "", esPerenne: false }); setEditId(null); setIsFormVisible(false); loadTipoCultivos(); onSuccess?.(); onCloseAlert?.(); } }]);
      } else {
        await registerTipoCultivo(formData);
        onShowAlert?.("Éxito", "Tipo de cultivo registrado correctamente", [{ text: 'OK', onPress: () => { setFormData({ nombre: "", esPerenne: false }); setEditId(null); setIsFormVisible(false); loadTipoCultivos(); onSuccess?.(); onCloseAlert?.(); } }]);
      }
    } catch (error: any) {
      console.error("Error saving tipo cultivo:", error);
      onShowAlert?.("Error", error.response?.data?.message || "Error en la operación", [{ text: 'OK', onPress: onCloseAlert }]);
    }
  };

  const handleEdit = (item: TipoCultivoData) => {
    setEditId(item.id!);
    setFormData({
      nombre: item.nombre,
      esPerenne: item.esPerenne || false,
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    onShowAlert?.(
      "Confirmar eliminación",
      "¿Seguro que deseas eliminar este tipo de cultivo?",
      [
        { text: "Cancelar", onPress: onCloseAlert, style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await deleteTipoCultivo(id);
              onShowAlert?.("Éxito", "Tipo de cultivo eliminado correctamente", [{ text: 'OK', onPress: () => { loadTipoCultivos(); onSuccess?.(); onCloseAlert?.(); } }]);
            } catch (error: any) {
              console.error("Error deleting tipo cultivo:", error);
              onShowAlert?.("Error", error.message || "Error al eliminar el tipo de cultivo", [{ text: 'OK', onPress: onCloseAlert }]);
            }
          },
          style: "destructive"
        },
      ]
    );
  };


  const {hasPermission, isInitializing, lastUpdate} = usePermission();

  const renderTipoCultivoItem = useCallback(({ item }: { item: TipoCultivoData }) => {
    const nombre = item.nombre || 'Sin nombre';
    const clasificacion = item.esPerenne ? 'Perenne' : 'Transitorio';

    return (
      <View style={styles.tipoCultivoCard}>
        <View style={styles.tipoCultivoHeader}>
          <Text style={styles.tipoCultivoTitle}>{nombre}</Text>
          <Text style={styles.tipoCultivoClasificacion}>{clasificacion}</Text>
        </View>

        <View style={styles.tipoCultivoActions}>
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

  return (
    <Modal visible={isOpen} transparent={true} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Gestionar Tipos de Cultivo</Text>
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
                setFormData({ nombre: "", esPerenne: false });
                setIsFormVisible(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Agregar Tipo de Cultivo</Text>
            </TouchableOpacity>
            )}

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
                    onClick={() => {
                      setFormData({ nombre: "", esPerenne: false });
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
        </View>
      </View>
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
  radioLabel: {
    fontSize: 14,
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
  tipoCultivoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tipoCultivoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  tipoCultivoClasificacion: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  tipoCultivoActions: {
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
});

export default TipoCultivoModal;