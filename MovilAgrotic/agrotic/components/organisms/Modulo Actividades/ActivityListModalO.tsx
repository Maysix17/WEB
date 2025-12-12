import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Boton from '../../atoms/Boton';
import type { Actividad } from '../../../types/Modulo Actividades/Actividades.types';

interface ActivityListModalProps {
  isVisible: boolean;
  onClose: () => void;
  activities: Actividad[];
  onCreateNew: () => void;
  onActivityPress: (activity: Actividad) => void;
  canCreateActivity?: boolean;
}

const ActivityListModalO: React.FC<ActivityListModalProps> = ({
  isVisible,
  onClose,
  activities,
  onCreateNew,
  onActivityPress,
  canCreateActivity = false,
}) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            {canCreateActivity && (
              <TouchableOpacity onPress={onCreateNew} style={styles.createButton}>
                <Text style={styles.createText}>Nuevo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            style={styles.flatList}
            contentContainerStyle={styles.content}
            data={activities}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <View style={styles.headerContainer}>
                <Text style={styles.sectionTitle}>Actividades del día</Text>
              </View>
            }
            renderItem={({ item: activity }) => (
              <TouchableOpacity
                style={styles.actividadCard}
                onPress={() => onActivityPress(activity)}
              >
                <View style={styles.actividadHeader}>
                  <Text style={styles.actividadTitle}>{activity.descripcion || 'Sin descripción'}</Text>
                  <View style={[styles.statusIndicator, activity.estado ? styles.statusActive : styles.statusCompleted]} />
                </View>
                <Text style={styles.actividadInfo}>Estado: {activity.estado ? 'Activa' : 'Finalizada'}</Text>
                <Text style={styles.actividadInfo}>Horas: {activity.horasDedicadas || 0}</Text>
              </TouchableOpacity>
            )}
            ListFooterComponent={null}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: 350,
    height: '60%',
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
  createButton: {
    padding: 6,
  },
  createText: {
    fontSize: 20,
    color: '#066839',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: '#6b7280',
  },
  flatList: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerContainer: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  actividadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actividadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actividadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#066839',
  },
  statusCompleted: {
    backgroundColor: '#ef4444',
  },
  actividadInfo: {
    fontSize: 14,
    color: '#374151',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
});

export default ActivityListModalO;