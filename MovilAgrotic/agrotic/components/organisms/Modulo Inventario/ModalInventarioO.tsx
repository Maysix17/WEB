import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import Constants from 'expo-constants';

interface LoteInventario {
  id: string;
  producto: {
    nombre: string;
    sku?: string;
    descripcion?: string;
    precioCompra?: string;
    capacidadPresentacion?: number;
    vidaUtilPromedioPorUsos?: number;
    categoria?: { nombre: string };
    unidadMedida?: { nombre: string; abreviatura: string };
    imgUrl?: string;
  };
  bodega: {
    nombre: string;
    numero?: string;
  };
  fechaIngreso: string;
  fechaVencimiento?: string;
  stock?: number;
  stockTotal?: number;
  cantidadDisponibleParaReservar?: number;
  cantidadReservada?: number;
  unidadAbreviatura?: string;
}

interface ProductDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  item: LoteInventario | null;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isVisible,
  onClose,
  item
}) => {
  console.log('ProductDetailModal render - isVisible:', isVisible, 'item:', item);
  if (!item) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Detalles del Producto</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {/* Información del Producto */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información del Producto</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.label}>Nombre:</Text>
                    <Text style={styles.value}>{item.producto.nombre}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.label}>Código (SKU):</Text>
                    <Text style={styles.value}>{item.producto.sku || 'No especificado'}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.label}>Descripción:</Text>
                    <Text style={styles.value}>{item.producto.descripcion || 'No disponible'}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.label}>Precio de Compra:</Text>
                    <Text style={styles.value}>${parseFloat(item.producto.precioCompra || '0').toFixed(2)}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.label}>Capacidad de Presentación:</Text>
                    <Text style={styles.value}>{item.producto.capacidadPresentacion || 'No especificada'}</Text>
                  </View>
                  {item.producto.vidaUtilPromedioPorUsos && (
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>Vida Útil Promedio por Usos:</Text>
                      <Text style={styles.value}>{item.producto.vidaUtilPromedioPorUsos} usos</Text>
                    </View>
                  )}
                  <View style={styles.infoItem}>
                    <Text style={styles.label}>Categoría:</Text>
                    <Text style={styles.value}>{item.producto.categoria?.nombre || 'No especificada'}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.label}>Unidad de Medida:</Text>
                    <Text style={styles.value}>{item.producto.unidadMedida?.nombre || 'No especificada'}</Text>
                  </View>
                </View>
              </View>

              {/* Información del Lote */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información del Lote</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.label}>Fecha de Ingreso:</Text>
                    <Text style={styles.value}>{formatDate(item.fechaIngreso)}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.label}>Fecha de Vencimiento:</Text>
                    <Text style={styles.value}>{item.fechaVencimiento ? formatDate(item.fechaVencimiento) : 'No especificada'}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.label}>Nombre de Bodega:</Text>
                    <Text style={styles.value}>{item.bodega.nombre}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.label}>Número de Bodega:</Text>
                    <Text style={styles.value}>{item.bodega.numero || 'No especificado'}</Text>
                  </View>
                </View>
              </View>

              {/* Imagen del producto */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Imagen del Producto</Text>
                {item.producto.imgUrl ? (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: `${Constants.expoConfig?.extra?.apiUrl || 'http://192.168.101.4:3000'}${item.producto.imgUrl}` }}
                      style={styles.productImage}
                      resizeMode="contain"
                      onError={(error) => {
                        console.error('Error loading image:', error);
                      }}
                    />
                  </View>
                ) : (
                  <View style={styles.noImageContainer}>
                    <Text style={styles.noImageText}>Sin imagen disponible</Text>
                  </View>
                )}
              </View>

              {/* Información del Stock */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información del Stock</Text>
                <View style={styles.stockGrid}>
                  <View style={styles.stockItem}>
                    <Text style={styles.stockLabel}>Stock</Text>
                    <Text style={styles.stockValue}>{item.stock?.toFixed(2) || '0.00'}</Text>
                    <Text style={styles.stockUnit}>{item.unidadAbreviatura || ''}</Text>
                  </View>
                  <View style={styles.stockItem}>
                    <Text style={styles.stockLabel}>Total Disp.</Text>
                    <Text style={styles.stockValue}>{item.stockTotal?.toFixed(2) || '0.00'}</Text>
                    <Text style={styles.stockUnit}>{item.unidadAbreviatura || ''}</Text>
                  </View>
                  <View style={styles.stockItem}>
                    <Text style={styles.stockLabel}>Disponible</Text>
                    <Text style={styles.stockValue}>{item.cantidadDisponibleParaReservar?.toFixed(2) || '0.00'}</Text>
                    <Text style={styles.stockUnit}>{item.unidadAbreviatura || ''}</Text>
                  </View>
                  <View style={styles.stockItem}>
                    <Text style={styles.stockLabel}>Reservado</Text>
                    <Text style={styles.stockValue}>{item.cantidadReservada?.toFixed(2) || '0.00'}</Text>
                    <Text style={styles.stockUnit}>{item.unidadAbreviatura || ''}</Text>
                  </View>
                </View>
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '95%',
    maxWidth: 600,
    maxHeight: '95%',
    minHeight: '85%',
    flexDirection: 'column',
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
  scrollContent: {
    flex: 1,
    maxHeight: '85%',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#111827',
    flex: 2,
    textAlign: 'right',
  },
  imageContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  productImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  noImageContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noImageText: {
    fontSize: 16,
    color: '#6b7280',
  },
  stockGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  stockItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  stockLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  stockValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  stockUnit: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default ProductDetailModal;