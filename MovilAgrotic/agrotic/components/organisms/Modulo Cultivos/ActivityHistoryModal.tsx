import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Boton from '@/components/atoms/Boton';
import { getActividadesByCultivoVariedadZonaId, getActividadesByDateWithActive } from '@/services/Modulo Actividades/actividadesService';
import type { Actividad } from '@/types/Modulo Actividades/Actividades.types';
import ActivityDetailModal from './ActivityDetailModal';

interface ActivityHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvzId: string;
  cultivoName: string;
}

const ActivityHistoryModal: React.FC<ActivityHistoryModalProps> = ({
  isOpen,
  onClose,
  cvzId,
  cultivoName
}) => {
  const [activities, setActivities] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Actividad | null>(null);

  useEffect(() => {
    if (isOpen && cvzId) {
      fetchActivities();
    }
  }, [isOpen, cvzId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await getActividadesByCultivoVariedadZonaId(cvzId);
      // Filter to only show finalized activities (estado === false)
      const finalizedActivities = data.filter((activity: Actividad) => activity.estado === false);
      setActivities(finalizedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const renderActivity = ({ item }: { item: Actividad }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityDate}>{formatDate(item.fechaAsignacion)}</Text>
        <Text style={styles.activityCategory}>
          {item.categoriaActividad?.nombre || 'Sin categoría'}
        </Text>
      </View>
      <Text style={styles.activityDescription}>{item.descripcion}</Text>
      <View style={styles.activityDetails}>
        <Text style={styles.activityDetail}>
          Zona: {item.cultivoVariedadZona?.zona?.nombre || 'Sin zona'}
        </Text>
        <Text style={styles.activityDetail}>
          Horas: {item.horasDedicadas || 0}
        </Text>
      </View>
      {item.observacion && (
        <Text style={styles.activityObservation}>Observación: {item.observacion}</Text>
      )}
      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => {
          setSelectedActivity(item);
          setIsDetailModalOpen(true);
        }}
      >
        <Text style={styles.detailButtonText}>Ver Detalles</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.title}>Historial de Actividades</Text>
            <Text style={styles.cultivoName}>{cultivoName}</Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#16A34A" />
                <Text style={styles.loadingText}>Cargando actividades...</Text>
              </View>
            ) : activities.length === 0 ? (
              <Text style={styles.placeholder}>No se encontraron actividades finalizadas.</Text>
            ) : (
              <FlatList
                data={activities}
                keyExtractor={(item) => item.id}
                renderItem={renderActivity}
                style={styles.activitiesList}
                showsVerticalScrollIndicator={false}
              />
            )}

            <Boton label="Cerrar" onClick={onClose} variant="light" />
          </View>
        </View>
      </Modal>

      <ActivityDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        activity={selectedActivity}
        cultivo={{
          nombrecultivo: cultivoName.split(' - ')[1] || cultivoName,
          lote: cultivoName.split(' - ')[2] || '',
          tipo_cultivo_nombre: cultivoName.split(' - ')[0] || '',
        }}
      />
    </>
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
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  cultivoName: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: '#374151',
  },
  placeholder: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#6b7280',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#6b7280',
    fontSize: 16,
  },
  activitiesList: {
    maxHeight: 400,
    marginBottom: 20,
  },
  activityItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  activityCategory: {
    fontSize: 12,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '500',
  },
  activityDescription: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 22,
  },
  activityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activityDetail: {
    fontSize: 14,
    color: '#6b7280',
  },
  activityObservation: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 6,
  },
  detailButton: {
    marginTop: 12,
    backgroundColor: '#22c55e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  detailButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ActivityHistoryModal;