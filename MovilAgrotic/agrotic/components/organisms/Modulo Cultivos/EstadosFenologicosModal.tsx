import React, { useState, useEffect, useCallback } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Boton from '@/components/atoms/Boton';
import CampoTexto from '@/components/atoms/CampoTexto';
import { estadosFenologicosService } from '@/services/Modulo Cultivos/estadosFenologicosService';
import type { EstadoFenologico } from '@/types/Modulo Cultivos/Cultivos.types';
import { usePermission } from '@/contexts/PermissionContext';

interface EstadosFenologicosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onShowAlert?: (title: string, message: string, buttons: any[]) => void;
  onCloseAlert?: () => void;
}

const EstadosFenologicosModal: React.FC<EstadosFenologicosModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowAlert,
  onCloseAlert
}) => {
  const [estados, setEstados] = useState<EstadoFenologico[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingEstado, setEditingEstado] = useState<EstadoFenologico | null>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', orden: '' });

  useEffect(() => {
    if (isOpen) {
      loadEstados();
    }
  }, [isOpen]);

  const loadEstados = async () => {
    setLoading(true);
    try {
      const data = await estadosFenologicosService.getEstadosFenologicos();
      setEstados(data);
    } catch (error) {
      onShowAlert?.('Error', 'No se pudieron cargar los estados fenológicos', [{ text: 'OK', onPress: onCloseAlert }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      onShowAlert?.('Error', 'El nombre es obligatorio', [{ text: 'OK', onPress: onCloseAlert }]);
      return;
    }
    if (!formData.orden.trim()) {
      onShowAlert?.('Error', 'El orden es obligatorio', [{ text: 'OK', onPress: onCloseAlert }]);
      return;
    }

    const ordenNum = parseInt(formData.orden) || 0;
    if (ordenNum <= 0) {
      onShowAlert?.('Error', 'El orden debe ser un número mayor a 0', [{ text: 'OK', onPress: onCloseAlert }]);
      return;
    }

    const dataToSend = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      orden: ordenNum,
    };

    try {
      if (editingEstado) {
        await estadosFenologicosService.updateEstadoFenologico(editingEstado.id, dataToSend);
        onShowAlert?.('Éxito', 'Estado fenológico actualizado correctamente', [{ text: 'OK', onPress: () => { resetForm(); loadEstados(); onSuccess?.(); onCloseAlert?.(); } }]);
      } else {
        await estadosFenologicosService.createEstadoFenologico(dataToSend);
        onShowAlert?.('Éxito', 'Estado fenológico creado correctamente', [{ text: 'OK', onPress: () => { resetForm(); loadEstados(); onSuccess?.(); onCloseAlert?.(); } }]);
      }
    } catch (error) {
      onShowAlert?.('Error', editingEstado ? 'Error al actualizar' : 'Error al crear', [{ text: 'OK', onPress: onCloseAlert }]);
    }
  };

  const handleDelete = async (id: number) => {
    const estado = estados.find(e => e.id === id);
    onShowAlert?.(
      "Confirmar eliminación",
      `¿Seguro que deseas eliminar el estado fenológico "${estado?.nombre || 'seleccionado'}"?`,
      [
        { text: "Cancelar", onPress: onCloseAlert, style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await estadosFenologicosService.deleteEstadoFenologico(id);
              onShowAlert?.("Éxito", "Estado fenológico eliminado correctamente", [{ text: 'OK', onPress: () => { loadEstados(); onSuccess?.(); onCloseAlert?.(); } }]);
            } catch (error: any) {
              console.error("Error deleting estado fenológico:", error);
              onShowAlert?.("Error", error.message || "Error al eliminar el estado fenológico", [{ text: 'OK', onPress: onCloseAlert }]);
            }
          },
          style: "destructive"
        },
      ]
    );
  };


  const {hasPermission, isInitializing, lastUpdate} = usePermission();

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '', orden: '' });
    setEditingEstado(null);
    setIsFormVisible(false);
  };

  const startEdit = (estado: EstadoFenologico) => {
    setFormData({
      nombre: estado.nombre,
      descripcion: estado.descripcion || '',
      orden: estado.orden?.toString() || ''
    });
    setEditingEstado(estado);
    setIsFormVisible(true);
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Estados Fenológicos</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {!isFormVisible && (
              <View style={styles.actions}>
                {!isInitializing && hasPermission('Cultivos', 'cultivos', 'crear') && (
                <Boton
                  label="Agregar Estado"
                  onClick={() => setIsFormVisible(true)}
                  variant="solid"
                />
                  )}
              </View>
              
            )}

            {isFormVisible && (
              <View style={styles.form}>
                <CampoTexto
                  etiqueta="Nombre"
                  marcador="Nombre del estado fenológico"
                  valor={formData.nombre}
                  alCambiar={(text) => setFormData(prev => ({ ...prev, nombre: text }))}
                />
                <CampoTexto
                  etiqueta="Descripción (opcional)"
                  marcador="Descripción del estado"
                  valor={formData.descripcion}
                  alCambiar={(text) => setFormData(prev => ({ ...prev, descripcion: text }))}
                  multiline
                  numberOfLines={3}
                />
                <CampoTexto
                  etiqueta="Orden"
                  marcador="Orden del estado (número)"
                  valor={formData.orden}
                  alCambiar={(text) => setFormData(prev => ({ ...prev, orden: text }))}
                  keyboardType="numeric"
                />
                <View style={styles.formActions}>
                  <Boton
                    label="Cancelar"
                    onClick={resetForm}
                    variant="light"
                    color="secondary"
                  />
                  <Boton label="Guardar" onClick={handleSave} />
                </View>
              </View>
            )}

            <View style={styles.list}>
              <Text style={styles.sectionTitle}>Estados Registrados ({estados.length})</Text>
              {loading ? (
                <Text style={styles.loadingText}>Cargando...</Text>
              ) : estados.length === 0 ? (
                <Text style={styles.emptyText}>No hay estados fenológicos registrados</Text>
              ) : (
                <>
                  {/* Debug estados array */}
                  {console.log('📋 Estados array for rendering:', estados.map(e => ({ id: e.id, nombre: e.nombre })))}
                  {estados.map((estado) => (
                    <View key={estado.id} style={styles.estadoCard}>
                      <View style={styles.estadoInfo}>
                        <Text style={styles.estadoNombre}>{estado.nombre}</Text>
                        {estado.descripcion && (
                          <Text style={styles.estadoDescripcion}>{estado.descripcion}</Text>
                        )}
                        {/* Debug info */}
                        <Text style={{fontSize: 10, color: 'red'}}>ID: {estado.id}</Text>
                      </View>
                      <View style={styles.estadoActions}>
                        {!isInitializing && hasPermission('Cultivos', 'cultivos', 'actualizar') && (
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => startEdit(estado)}
                        >
                          <Text style={styles.editText}>Editar</Text>
                        </TouchableOpacity>
                        )}
                        {!isInitializing && hasPermission('Cultivos', 'cultivos', 'eliminar') && (
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => {
                            console.log('🖱️ Delete button pressed for estado:', estado.id, estado.nombre);
                            handleDelete(estado.id!);
                          }}
                        >
                          <Text style={styles.deleteText}>Eliminar</Text>
                        </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: '#6b7280',
  },
  content: {
    maxHeight: 500,
  },
  actions: {
    marginBottom: 20,
  },
  form: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    gap: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  list: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    padding: 20,
  },
  estadoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estadoInfo: {
    flex: 1,
  },
  estadoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  estadoDescripcion: {
    fontSize: 14,
    color: '#6b7280',
  },
  estadoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default EstadosFenologicosModal;