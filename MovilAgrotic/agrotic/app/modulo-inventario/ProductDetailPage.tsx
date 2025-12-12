import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';
import MenuO from '@/components/organisms/General/MenuO';
import type { LoteInventario } from '@/types/Modulo Inventario/Inventario.types';

const ProductDetailPage = () => {
  const { item } = useLocalSearchParams();
  const parsedItem: LoteInventario = JSON.parse(item as string);
  const [isMenuOpen, setIsMenuOpen] = useState(false);


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
    <View style={styles.container}>
      <StatusBar backgroundColor="#066839" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuOpen(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del Producto</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Información del Producto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Producto</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Nombre:</Text>
                <Text style={styles.value}>{parsedItem.producto.nombre}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Código (SKU):</Text>
                <Text style={styles.value}>{parsedItem.producto.sku || 'No especificado'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Descripción:</Text>
                <Text style={styles.value}>{parsedItem.producto.descripcion || 'No disponible'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Precio de Compra:</Text>
                <Text style={styles.value}>${parseFloat(parsedItem.producto.precioCompra || '0').toFixed(2)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Capacidad de Presentación:</Text>
                <Text style={styles.value}>{parsedItem.producto.capacidadPresentacion || 'No especificada'}</Text>
              </View>
              {parsedItem.producto.vidaUtilPromedioPorUsos && (
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Vida Útil Promedio por Usos:</Text>
                  <Text style={styles.value}>{parsedItem.producto.vidaUtilPromedioPorUsos} usos</Text>
                </View>
              )}
              <View style={styles.infoItem}>
                <Text style={styles.label}>Categoría:</Text>
                <Text style={styles.value}>{parsedItem.producto.categoria?.nombre || 'No especificada'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Unidad de Medida:</Text>
                <Text style={styles.value}>{parsedItem.producto.unidadMedida?.nombre || 'No especificada'}</Text>
              </View>
            </View>
          </View>

          {/* Información del Lote */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Lote</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Fecha de Ingreso:</Text>
                <Text style={styles.value}>{formatDate(parsedItem.fechaIngreso)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Fecha de Vencimiento:</Text>
                <Text style={styles.value}>{parsedItem.fechaVencimiento ? formatDate(parsedItem.fechaVencimiento) : 'No especificada'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Nombre de Bodega:</Text>
                <Text style={styles.value}>{parsedItem.bodega.nombre}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Número de Bodega:</Text>
                <Text style={styles.value}>{parsedItem.bodega.numero || 'No especificado'}</Text>
              </View>
            </View>
          </View>

          {/* Imagen del producto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Imagen del Producto</Text>
            {parsedItem.producto.imgUrl ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: `${Constants.expoConfig?.extra?.apiUrl || 'http://192.168.101.4:3000'}${parsedItem.producto.imgUrl}` }}
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
                <Text style={styles.stockValue}>{parsedItem.stock?.toFixed(2) || '0.00'}</Text>
                <Text style={styles.stockUnit}>{parsedItem.unidadAbreviatura || ''}</Text>
              </View>
              <View style={styles.stockItem}>
                <Text style={styles.stockLabel}>Total Disp.</Text>
                <Text style={styles.stockValue}>{parsedItem.stockTotal?.toFixed(2) || '0.00'}</Text>
                <Text style={styles.stockUnit}>{parsedItem.unidadAbreviatura || ''}</Text>
              </View>
              <View style={styles.stockItem}>
                <Text style={styles.stockLabel}>Disponible</Text>
                <Text style={styles.stockValue}>{parsedItem.cantidadDisponibleParaReservar?.toFixed(2) || '0.00'}</Text>
                <Text style={styles.stockUnit}>{parsedItem.unidadAbreviatura || ''}</Text>
              </View>
              <View style={styles.stockItem}>
                <Text style={styles.stockLabel}>Reservado</Text>
                <Text style={styles.stockValue}>{parsedItem.cantidadReservada?.toFixed(2) || '0.00'}</Text>
                <Text style={styles.stockUnit}>{parsedItem.unidadAbreviatura || ''}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Menú lateral */}
      <MenuO isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#066839',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 45,
    shadowColor: '#000',
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
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    flex: 1,
    height: '100%',
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

export default ProductDetailPage;