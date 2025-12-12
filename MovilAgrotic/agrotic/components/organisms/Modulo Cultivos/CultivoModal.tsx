import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import Boton from "../../atoms/Boton";
import CustomAlertModal from "../../molecules/CustomAlertModal";
import { cultivosService } from "../../../services/Modulo Cultivos/cultivosService";
import { getTipoCultivos } from "../../../services/Modulo Cultivos/tipoCultivoService";
import { getVariedades } from "../../../services/Modulo Cultivos/variedadService";
import { zonaService } from "../../../services/Modulo Zonas/zonaService";
import type { TipoCultivoData } from "../../../types/Modulo Cultivos/TipoCultivo.types";
import type { VariedadData } from "../../../types/Modulo Cultivos/Variedad.types";

interface CultivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CultivoFormData {
  tipoCultivoId: string;
  variedadId: string;
  zonaId: string;
  cantidad_plantas_inicial: number | undefined;
}

const CultivoModal: React.FC<CultivoModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [cultivoData, setCultivoData] = useState<CultivoFormData>({
    tipoCultivoId: "",
    variedadId: "",
    zonaId: "",
    cantidad_plantas_inicial: undefined,
  });

  const [tipoCultivos, setTipoCultivos] = useState<TipoCultivoData[]>([]);
  const [variedades, setVariedades] = useState<VariedadData[]>([]);
  const [filteredVariedades, setFilteredVariedades] = useState<VariedadData[]>([]);
  const [zonas, setZonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTipoCultivoModal, setShowTipoCultivoModal] = useState(false);
  const [showVariedadModal, setShowVariedadModal] = useState(false);
  const [showZonaModal, setShowZonaModal] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Filtrar variedades cuando cambia el tipo de cultivo seleccionado
  useEffect(() => {
    if (cultivoData.tipoCultivoId) {
      const filtered = variedades.filter(v => v.fkTipoCultivoId === cultivoData.tipoCultivoId);
      setFilteredVariedades(filtered);
      // Resetear la variedad seleccionada si no pertenece al nuevo tipo de cultivo
      if (cultivoData.variedadId && !filtered.find(v => v.id === cultivoData.variedadId)) {
        setCultivoData({ ...cultivoData, variedadId: "" });
      }
    } else {
      setFilteredVariedades(variedades); // Mostrar todas si no hay tipo seleccionado
    }
  }, [cultivoData.tipoCultivoId, variedades]);

  const loadData = async () => {
    try {
      const [tiposData, variedadesData, zonasData] = await Promise.all([
        getTipoCultivos(),
        getVariedades(),
        zonaService.getAll()
      ]);
      setTipoCultivos(tiposData || []);
      setVariedades(variedadesData || []);
      setZonas(zonasData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      showAlert("Error", "No se pudieron cargar los datos");
    }
  };

  const showAlert = (title: string, message: string, buttons?: any[]) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertButtons(buttons || [{ text: 'OK', onPress: () => setAlertVisible(false) }]);
    setAlertVisible(true);
  };

  const handleSubmit = async () => {
    // Validations
    if (!cultivoData.tipoCultivoId) {
      showAlert("Error", "Debe seleccionar un tipo de cultivo");
      return;
    }
    if (!cultivoData.variedadId) {
      showAlert("Error", "Debe seleccionar una variedad");
      return;
    }
    if (!cultivoData.zonaId) {
      showAlert("Error", "Debe seleccionar una zona");
      return;
    }
    if (!cultivoData.cantidad_plantas_inicial || cultivoData.cantidad_plantas_inicial <= 0) {
      showAlert("Error", "Debe ingresar una cantidad de plantas inicial mayor a 0");
      return;
    }

    setLoading(true);
    try {
      // Here you would call the API to create the cultivo
      const data = {
        tipoCultivoId: cultivoData.tipoCultivoId,
        variedadId: cultivoData.variedadId,
        zonaId: cultivoData.zonaId,
        cantidad_plantas_inicial: cultivoData.cantidad_plantas_inicial,
      };
      console.log("Cultivo data:", data);
      await cultivosService.create(data);
      showAlert("Éxito", "Cultivo registrado correctamente", [
        { text: "OK", onPress: () => {
          setAlertVisible(false);
          onSuccess?.();
          onClose();
          resetForm();
        }}
      ]);
    } catch (error: any) {
      console.error("Error creating cultivo:", error);
      showAlert("Error", error.response?.data?.message || "Error al registrar el cultivo");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCultivoData({
      tipoCultivoId: "",
      variedadId: "",
      zonaId: "",
      cantidad_plantas_inicial: undefined,
    });
  };

  const getSelectedTipoCultivo = () => {
    return tipoCultivos.find(t => t.id === cultivoData.tipoCultivoId)?.nombre || "";
  };

  const getSelectedVariedad = () => {
    return filteredVariedades.find(v => v.id === cultivoData.variedadId)?.nombre || "";
  };

  const getSelectedZona = () => {
    return zonas.find(z => z.id === cultivoData.zonaId)?.nombre || "";
  };

  const renderSelectorOption = (item: any, onSelect: (id: string) => void) => (
    <TouchableOpacity
      key={item.id}
      style={styles.selectorOption}
      onPress={() => onSelect(item.id)}
    >
      <Text style={styles.selectorOptionText}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={isOpen} transparent={true} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Registrar Nuevo Cultivo</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Tipo de Cultivo</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowTipoCultivoModal(true)}
            >
              <Text style={styles.selectorText}>
                {getSelectedTipoCultivo() || "Seleccione un tipo de cultivo"}
              </Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Variedad</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowVariedadModal(true)}
            >
              <Text style={styles.selectorText}>
                {cultivoData.tipoCultivoId
                  ? (getSelectedVariedad() || "Seleccione una variedad")
                  : "Primero seleccione un tipo de cultivo"}
              </Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Ubicación</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowZonaModal(true)}
            >
              <Text style={styles.selectorText}>
                {getSelectedZona() || "Seleccione una zona"}
              </Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Cantidad de Plantas Inicial</Text>
            <TextInput
              style={styles.input}
              value={cultivoData.cantidad_plantas_inicial?.toString() || ""}
              onChangeText={(text) => setCultivoData({ ...cultivoData, cantidad_plantas_inicial: text ? parseInt(text) : undefined })}
              placeholder="Ingrese la cantidad inicial de plantas"
              keyboardType="numeric"
            />

            <View style={styles.buttonContainer}>
              <Boton
                label="Registrar Cultivo"
                onClick={handleSubmit}
                variant="solid"
                color="success"
              />
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Tipo Cultivo Selector Modal */}
      <Modal visible={showTipoCultivoModal} transparent={true} animationType="fade">
        <View style={styles.selectorOverlay}>
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorTitle}>Seleccionar Tipo de Cultivo</Text>
            <ScrollView style={styles.selectorScroll}>
              {tipoCultivos.map((tipo) => renderSelectorOption(tipo, (id) => {
                setCultivoData({ ...cultivoData, tipoCultivoId: id });
                setShowTipoCultivoModal(false);
              }))}
            </ScrollView>
            <TouchableOpacity
              style={styles.selectorCloseButton}
              onPress={() => setShowTipoCultivoModal(false)}
            >
              <Text style={styles.selectorCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Variedad Selector Modal */}
      <Modal visible={showVariedadModal} transparent={true} animationType="fade">
        <View style={styles.selectorOverlay}>
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorTitle}>Seleccionar Variedad</Text>
            <ScrollView style={styles.selectorScroll}>
              {filteredVariedades.map((variedad) => renderSelectorOption(variedad, (id) => {
                setCultivoData({ ...cultivoData, variedadId: id });
                setShowVariedadModal(false);
              }))}
            </ScrollView>
            <TouchableOpacity
              style={styles.selectorCloseButton}
              onPress={() => setShowVariedadModal(false)}
            >
              <Text style={styles.selectorCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Zona Selector Modal */}
      <Modal visible={showZonaModal} transparent={true} animationType="fade">
        <View style={styles.selectorOverlay}>
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorTitle}>Seleccionar Zona</Text>
            <ScrollView style={styles.selectorScroll}>
              {zonas.map((zona) => renderSelectorOption(zona, (id) => {
                setCultivoData({ ...cultivoData, zonaId: id });
                setShowZonaModal(false);
              }))}
            </ScrollView>
            <TouchableOpacity
              style={styles.selectorCloseButton}
              onPress={() => setShowZonaModal(false)}
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
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
  selectorOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  selectorOptionText: {
    fontSize: 16,
    color: "#374151",
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
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#374151",
    backgroundColor: "#ffffff",
  },
});

export default CultivoModal;