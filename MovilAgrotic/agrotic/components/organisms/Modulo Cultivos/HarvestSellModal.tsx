import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Boton from '../../atoms/Boton';
import { cultivosService } from '../../../services/Modulo Cultivos/cultivosService';
import { cosechasService } from '../../../services/Modulo Cultivos/cosechasService';
import type { ItemCultivo } from '../../../types/Modulo Cultivos/Cultivos.types';
import type { Cosecha } from '../../../types/Modulo Cultivos/Cosechas.types';
import { usePermissions } from '@/hooks/usePermissionSelectors';
import { usePermission } from '@/contexts/PermissionContext';

interface HarvestSellModalProps {
  isOpen: boolean;
  onClose: () => void;
  cultivo: ItemCultivo | null;
  onHarvest?: () => void;
  onSell?: () => void;
  onFinalize?: () => void;
  onShowAlert?: (title: string, message: string, buttons: any[]) => void;
  onCloseAlert?: () => void;
}

const HarvestSellModal: React.FC<HarvestSellModalProps> = React.memo(({
  isOpen,
  onClose,
  cultivo,
  onHarvest,
  onSell,
  onFinalize,
  onShowAlert,
  onCloseAlert,
}) => {
  console.log('HarvestSellModal rendered, isOpen:', isOpen, 'cultivo:', cultivo?.nombrecultivo);

  // Hooks SIEMPRE se llaman, sin depender de isOpen, para cumplir las reglas de Hooks
  const {hasPermission, isInitializing} = usePermission();
  const [cosechasDisponibles, setCosechasDisponibles] = useState<Cosecha[]>([]);
  const [loading, setLoading] = useState(false);
  const [fullCultivo, setFullCultivo] = useState<ItemCultivo | null>(null);

  const loadFullCultivo = async () => {
    if (!cultivo?.id) return;
    try {
      const data = await cultivosService.getById(cultivo.id);
      setFullCultivo(data);
    } catch (error) {
      console.error('Error loading full cultivo:', error);
    }
  };

  const loadCosechasDisponibles = async () => {
    if (!cultivo) return;
    setLoading(true);
    try {
      const cosechas = await cosechasService.getCosechasByCultivo(cultivo.cvzid);
      setCosechasDisponibles(cosechas || []);
    } catch (error) {
      console.error('Error loading cosechas:', error);
      setCosechasDisponibles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && cultivo) {
      loadCosechasDisponibles();
    }
  }, [isOpen, cultivo]);

  const currentCultivo = cultivo;

  // Protecciones contra errores en cálculos
  let isPerenne = false;
  let hasCosecha = false;
  let hasRemainingQuantity = false;
  let allSold = false;
  let isFinalizado = false;
  let hasCosechasAbiertas = false;

  try {
    // Lista de nombres de cultivos perennes conocidos
    const perenneNames = ['café', 'cacao', 'palma', 'banano', 'manzano', 'naranjo', 'plátano', 'uva', 'olivo', 'almendra'];
    const nombreTipo = currentCultivo?.tipo_cultivo_nombre || currentCultivo?.tipoCultivo?.nombre || '';
    const isNombrePerenne = perenneNames.some(name => nombreTipo.toLowerCase().includes(name));

    isPerenne = currentCultivo?.tipoCultivo?.esPerenne || isNombrePerenne || false;
    hasCosecha = !!currentCultivo?.cosechaid;
    hasRemainingQuantity = cosechasDisponibles.some(c => c.cantidadDisponible > 0);
    allSold = !isPerenne && hasCosecha && !hasRemainingQuantity && cosechasDisponibles.length > 0;
    isFinalizado = currentCultivo?.estado === 0 || allSold;
    hasCosechasAbiertas = cosechasDisponibles.some(c => !c.cerrado);
  } catch (error) {
    console.error('Error calculating harvest/sell modal state:', error);
    // Valores por defecto seguros
    isPerenne = false;
    hasCosecha = false;
    hasRemainingQuantity = false;
    allSold = false;
    isFinalizado = true; // Si hay error, mejor mostrar como finalizado para evitar operaciones
    hasCosechasAbiertas = false;
  }

  const handleCloseCurrentHarvest = async () => {
    if (!cultivo) return;

    try {
      const confirmMessage = isPerenne
        ? '¿Estás seguro de cerrar la venta de cosecha actual?\n\nEsto deshabilitará las ventas de todas las cosechas actuales hasta que registres una nueva cosecha.'
        : '¿Estás seguro de cerrar la venta de cosecha actual?\n\nEsto cerrará todas las ventas de las cosechas actuales.';

      onShowAlert?.(
        'Confirmar',
        confirmMessage,
        [
          { text: 'Cancelar', onPress: onCloseAlert },
          {
            text: 'Confirmar',
            onPress: async () => {
              try {
                await cosechasService.closeAllHarvestsByCultivo(cultivo.cvzid);
                onShowAlert?.('Éxito', 'Cosechas cerradas exitosamente', [
                  { text: 'OK', onPress: () => { loadCosechasDisponibles(); onCloseAlert?.(); } }
                ]);
              } catch (error) {
                console.error('Error closing harvests:', error);
                onShowAlert?.('Error', 'Error al cerrar cosechas', [{ text: 'OK', onPress: onCloseAlert }]);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in handleCloseCurrentHarvest:', error);
      onShowAlert?.('Error', 'Ocurrió un error inesperado', [{ text: 'OK', onPress: () => {} }]);
    }
  };

  const handleFinalizeCultivo = async () => {
    if (!cultivo) return;

    try {
      onShowAlert?.(
        'Confirmar',
        '¿Estás seguro de finalizar este cultivo?\n\nEsta acción marcará el cultivo como finalizado y no se podrán registrar más actividades ni cosechas.',
        [
          { text: 'Cancelar', onPress: onCloseAlert },
          {
            text: 'Confirmar',
            onPress: () => {
              try {
                onFinalize?.();
                onClose();
              } catch (error) {
                console.error('Error in finalize callback:', error);
                onClose();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in handleFinalizeCultivo:', error);
      onShowAlert?.('Error', 'Ocurrió un error inesperado', [{ text: 'OK', onPress: () => {} }]);
    }
  };

  // Si el modal no está abierto o no hay cultivo seleccionado, no renderizamos nada,
  // pero igualmente ya se llamaron los hooks arriba (regla de Hooks respetada)
  if (!isOpen || !cultivo) {
    return null;
  }

  console.log('HarvestSellModal render - isPerenne:', isPerenne, 'tipoCultivo:', currentCultivo?.tipoCultivo, 'tipo_cultivo_nombre:', currentCultivo?.tipo_cultivo_nombre);

  return (
    <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
      {isFinalizado ? (
        <View style={styles.finalizedModalContainer}>
          <View style={styles.finalizedHeader}>
            <Text style={styles.finalizedTitle}>Cultivo Finalizado</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.finalizedContent}>
            <Text style={styles.finalizedMessage}>
              Este cultivo ya ha sido finalizado y no se pueden realizar más operaciones.
            </Text>
            <TouchableOpacity style={styles.finalizedButton} onPress={onClose}>
              <Text style={styles.finalizedButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Gestión de Cosecha y Venta</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Info del cultivo */}
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Cultivo:</Text>
                <Text style={styles.value}>
                  {(() => {
                    try {
                      return cultivo?.tipo_cultivo_nombre || cultivo?.tipoCultivo?.nombre || 'N/A';
                    } catch (error) {
                      console.error('Error getting crop type:', error);
                      return 'N/A';
                    }
                  })()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Variedad:</Text>
                <Text style={styles.value}>
                  {(() => {
                    try {
                      return cultivo?.nombrecultivo || 'N/A';
                    } catch (error) {
                      console.error('Error getting variety:', error);
                      return 'N/A';
                    }
                  })()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Tipo:</Text>
                <Text style={styles.value}>
                  {isPerenne ? 'Perenne' : 'Transitorio'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Estado:</Text>
                <Text style={[styles.value, (() => {
                  try {
                    return (fullCultivo || cultivo)?.estado === 1 ? styles.statusActive : styles.statusFinished;
                  } catch (error) {
                    console.error('Error getting status:', error);
                    return styles.statusFinished;
                  }
                })()]}>
                  {(() => {
                    try {
                      return (fullCultivo || cultivo)?.estado === 1 ? 'En Curso' : 'Finalizado';
                    } catch (error) {
                      console.error('Error getting status text:', error);
                      return 'Finalizado';
                    }
                  })()}
                </Text>
              </View>
            </View>

            {/* Botones de acciones */}
            <View style={styles.buttonsContainer}>
              <Boton
                text="Registrar Nueva Cosecha"
                onClick={() => {
                  onHarvest?.();
                  onClose();
                }}
                variant="solid"
                color="primary"
                disabled={isFinalizado || (!isPerenne && hasCosecha)}
              />

              <Boton
                text="Registrar Venta"
                onClick={() => {
                  onSell?.();
                  onClose();
                }}
                variant="solid"
                color="success"
                disabled={(() => {
                  try {
                    return (isPerenne && isFinalizado) || (!isPerenne && !hasCosecha) || (isPerenne && cosechasDisponibles.filter(c => !c.cerrado && c.cantidadDisponible > 0).length === 0) || (!isPerenne && hasCosecha && cosechasDisponibles.every(c => c.cerrado));
                  } catch (error) {
                    console.error('Error calculating sell button disabled state:', error);
                    return true; // Deshabilitar por defecto si hay error
                  }
                })()}
              />

            {hasCosechasAbiertas && !isInitializing && hasPermission('Cultivos', 'cultivos', 'actualizar') && (
  <Boton
    text="Cerrar venta de cosecha actual"
    onClick={handleCloseCurrentHarvest}
    variant="solid"
    color="warning"
    disabled={isFinalizado}
  />
)}
{isPerenne && !isFinalizado && !isInitializing && hasPermission('Cultivos', 'cultivos', 'actualizar') && (
  <Boton
    text="Finalizar Cultivo"
    onClick={handleFinalizeCultivo}
    variant="solid"
    color="danger"
    disabled={false}
  />
)}
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
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
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  statusActive: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  statusFinished: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  historySection: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  finalizedModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  finalizedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  finalizedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  finalizedContent: {
    padding: 20,
    alignItems: 'center',
  },
  finalizedMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  finalizedButton: {
    backgroundColor: '#066839',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  finalizedButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

HarvestSellModal.displayName = 'HarvestSellModal';

export default HarvestSellModal;