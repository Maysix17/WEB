import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import CampoTexto from '../../atoms/CampoTexto';
import Boton from '../../atoms/Boton';
import CustomAlertModal from '../../molecules/CustomAlertModal';
import { categoriaService } from '../../../services/Modulo Actividades/actividades/BuscarCategoria';
import userSearchService from '../../../services/Modulo Usuarios/userSearchService';
import zoneSearchService from '../../../services/Modulo Actividades/actividades/BuscarZona';
import apiClient from '../../../services/General/axios/axios';
import { createActividad, createUsuarioXActividad, createReservationByProduct, updateActividadCompleta } from '../../../services/Modulo Actividades/actividadesService';
import type { User } from '../../../services/Modulo Actividades/actividades/BuscadorUsuarios';
import type { Actividad } from '../../../types/Modulo Actividades/Actividades.types';
import { usePermission } from '../../../contexts/PermissionContext';

interface Product {
  id: string;
  nombre: string;
  categoria?: { nombre: string; esDivisible?: boolean };
  cantidadDisponible: number;
  cantidadReservada: number;
  cantidadParcial: number;
  stock_devuelto?: number;
  stock_parcial?: number;
  unidadMedida?: { abreviatura: string };
  reservas?: {
    cantidadReservada: number;
    cantidadDevuelta: number;
    estado: { nombre: string };
  }[];
}

interface Categoria {
  id: string;
  nombre: string;
}

interface Zona {
  id: string;
  nombre: string;
  zonaId?: string;
  cultivoId?: string;
  variedadNombre?: string;
}

interface ActividadModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onActivityCreated: () => void;
  activityToUpdate?: Actividad | null;
}

const ActividadModalO: React.FC<ActividadModalProps> = React.memo(({
  isVisible,
  onClose,
  selectedDate,
  onActivityCreated,
  activityToUpdate,
}) => {
  const { hasPermission, isInitializing, lastUpdate } = usePermission();
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [loteSearch, setLoteSearch] = useState('');

  const [debouncedUsuarioSearch, setDebouncedUsuarioSearch] = useState('');
  const [debouncedProductSearch, setDebouncedProductSearch] = useState('');
  const [debouncedLoteSearch, setDebouncedLoteSearch] = useState('');

  const [selectedUsuarios, setSelectedUsuarios] = useState<User[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{ [key: string]: { product: Product; qty: string; custom: boolean; isSurplus?: boolean } }>({});
  const [selectedLote, setSelectedLote] = useState<Zona | null>(null);

  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const [filteredUsuarios, setFilteredUsuarios] = useState<User[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredZonas, setFilteredZonas] = useState<Zona[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  // estado para modal de alertas
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<any[]>([]);

  const showAlert = (title: string, message: string, buttons?: any[]) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertButtons(buttons || [{ text: 'OK', onPress: () => setAlertVisible(false) }]);
    setAlertVisible(true);
  };

  const resetForm = () => {
    setUsuarioSearch('');
    setProductSearch('');
    setLoteSearch('');
    setDebouncedUsuarioSearch('');
    setDebouncedProductSearch('');
    setDebouncedLoteSearch('');
    setSelectedUsuarios([]);
    setSelectedProducts({});
    setSelectedLote(null);
    setCategoria('');
    setDescripcion('');
    setFilteredUsuarios([]);
    setFilteredProducts([]);
    setFilteredZonas([]);
    setErrors({});
  };

  const populateFormForUpdate = async () => {
    if (!activityToUpdate) return;

    // Populate basic fields
    setCategoria(activityToUpdate.fkCategoriaActividadId || '');
    setDescripcion(activityToUpdate.descripcion || '');

    // Populate selected lote
    if (activityToUpdate.cultivoVariedadZona) {
      setSelectedLote({
        id: activityToUpdate.fkCultivoVariedadZonaId || '',
        nombre: activityToUpdate.cultivoVariedadZona.zona?.nombre || '',
        zonaId: activityToUpdate.cultivoVariedadZona.zona?.id || '',
        cultivoId: activityToUpdate.cultivoVariedadZona.cultivoXVariedad?.id || '',
        variedadNombre: activityToUpdate.cultivoVariedadZona.cultivoXVariedad?.variedad?.nombre || '',
      });
    }

    // Populate usuarios asignados
    if (activityToUpdate.usuariosAsignados && activityToUpdate.usuariosAsignados.length > 0) {
      setSelectedUsuarios(activityToUpdate.usuariosAsignados.map(uxa => ({
        id: uxa.usuario.dni.toString(),
        nombres: uxa.usuario.nombres,
        apellidos: uxa.usuario.apellidos,
        dni: uxa.usuario.dni
      })));
    }

    // Populate reservas
    if (activityToUpdate.reservas && activityToUpdate.reservas.length > 0) {
      const productsMap: { [key: string]: { product: Product; qty: string; custom: boolean; isSurplus?: boolean } } = {};
      activityToUpdate.reservas.forEach(reserva => {
        if (reserva.lote?.producto) {
          productsMap[reserva.lote.producto.id] = {
            product: reserva.lote.producto,
            qty: reserva.cantidadReservada.toString(),
            custom: true,
            isSurplus: false,
          };
        }
      });
      setSelectedProducts(productsMap);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchCategorias();
      resetForm();
      if (activityToUpdate) {
        populateFormForUpdate();
      }
    }
  }, [isVisible, activityToUpdate]);

  // Consolidated debounced search effects
  useEffect(() => {
    const usuarioTimer = setTimeout(() => setDebouncedUsuarioSearch(usuarioSearch), 300);
    const productTimer = setTimeout(() => setDebouncedProductSearch(productSearch), 300);
    const loteTimer = setTimeout(() => setDebouncedLoteSearch(loteSearch), 300);

    return () => {
      clearTimeout(usuarioTimer);
      clearTimeout(productTimer);
      clearTimeout(loteTimer);
    };
  }, [usuarioSearch, productSearch, loteSearch]);

  const fetchCategorias = async () => {
    try {
      const data = await categoriaService.getAll();
      setCategorias(data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  // Memoized search functions
  const fetchFilteredUsuarios = useCallback(async (searchTerm: string) => {
    if (searchTerm.trim()) {
      try {
        const data = await userSearchService.search(searchTerm);
        setFilteredUsuarios(data.items);
      } catch (error) {
        console.error('Error searching usuarios:', error);
        setFilteredUsuarios([]);
      }
    } else {
      setFilteredUsuarios([]);
    }
  }, []);

  const fetchFilteredProducts = useCallback(async (searchTerm: string) => {
    if (searchTerm.trim()) {
      try {
        const response = await apiClient.get(`/inventario/search/${encodeURIComponent(searchTerm)}`);
        const result = response.data;
        const productsWithAvailability = (result.items || []).map((product: Product) => {
          let cantidadReservadaActiva = 0;
          if (product.reservas) {
            for (const reserva of product.reservas) {
              if (reserva.estado && reserva.estado.nombre !== 'Confirmada') {
                cantidadReservadaActiva += (reserva.cantidadReservada || 0) - (reserva.cantidadDevuelta || 0);
              }
            }
          }
          const cantidadDisponibleNum = Number(product.cantidadDisponible) || 0;
          const cantidadParcialNum = Number(product.cantidadParcial) || 0;
          const cantidadDisponibleReal = cantidadDisponibleNum + cantidadParcialNum - cantidadReservadaActiva;
          return {
            ...product,
            cantidadDisponibleReal: Math.max(0, cantidadDisponibleReal)
          };
        });
        setFilteredProducts(productsWithAvailability);
      } catch (error) {
        console.error('Error searching products:', error);
        setFilteredProducts([]);
      }
    } else {
      setFilteredProducts([]);
    }
  }, []);

  const fetchFilteredZonas = useCallback(async (searchTerm: string) => {
    if (searchTerm.trim()) {
      try {
        const data = await zoneSearchService.search(searchTerm);
        setFilteredZonas(data.items);
      } catch (error) {
        console.error('Error searching zonas:', error);
        setFilteredZonas([]);
      }
    } else {
      setFilteredZonas([]);
    }
  }, []);

  // Consolidated search effects
  useEffect(() => { fetchFilteredUsuarios(debouncedUsuarioSearch); }, [debouncedUsuarioSearch, fetchFilteredUsuarios]);
  useEffect(() => { fetchFilteredProducts(debouncedProductSearch); }, [debouncedProductSearch, fetchFilteredProducts]);
  useEffect(() => { fetchFilteredZonas(debouncedLoteSearch); }, [debouncedLoteSearch, fetchFilteredZonas]);

  const handleSelectUsuario = (usuario: User) => {
    if (activityToUpdate) return; // No permitir cambios en modo edición
    if (!selectedUsuarios.some(u => u.id === usuario.id)) {
      setSelectedUsuarios([...selectedUsuarios, usuario]);
      setUsuarioSearch('');
    }
  };

  const handleRemoveUsuario = (id: string) => {
    if (activityToUpdate) return; // No permitir cambios en modo edición
    setSelectedUsuarios(selectedUsuarios.filter(u => u.id !== id));
  };

  const handleSelectProduct = (product: Product) => {
    if (selectedProducts[product.id]) {
      const newSelected = { ...selectedProducts };
      delete newSelected[product.id];
      setSelectedProducts(newSelected);
    } else {
      setSelectedProducts({
        ...selectedProducts,
        [product.id]: {
          product,
          qty: "0",
          custom: false,
          isSurplus: false
        }
      });
      setProductSearch('');
    }
  };

  const handleQtyChange = (id: string, qty: string) => {
    if (activityToUpdate) return; // No permitir cambios en modo edición
    setSelectedProducts({
      ...selectedProducts,
      [id]: {
        ...selectedProducts[id],
        qty,
        custom: true
      }
    });
  };

  const handleSelectLote = (zona: Zona) => {
    setSelectedLote(zona);
    setLoteSearch('');
  };

  const handleRemoveLote = () => {
    if (activityToUpdate) return; // No permitir cambios en modo edición
    setSelectedLote(null);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (selectedUsuarios.length === 0) {
      newErrors.usuarios = 'Debes asignar al menos un usuario';
    }

    if (!categoria) {
      newErrors.categoria = 'Selecciona una categoría';
    }

    if (!descripcion.trim()) {
      newErrors.descripcion = 'Ingresa una descripción';
    }

    if (!selectedLote) {
      newErrors.lote = 'Ingresa una ubicación';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const validationPromises = Object.values(selectedProducts).map(async (prod) => {
      const requestedQty = parseFloat(prod.qty) || 0;
      if (prod.isSurplus) {
        const surplusStock = prod.product.stock_parcial || 0;
        if (requestedQty > surplusStock) {
          return { valid: false, product: prod.product.nombre, requested: requestedQty, available: surplusStock, type: 'parcial' };
        }
      } else {
        let cantidadReservadaActiva = 0;
        if (prod.product.reservas) {
          for (const reserva of prod.product.reservas) {
            if (reserva.estado && reserva.estado.nombre !== 'Confirmada') {
              cantidadReservadaActiva += (reserva.cantidadReservada || 0) - (reserva.cantidadDevuelta || 0);
            }
          }
        }
        const cantidadDisponibleNum = Number(prod.product.cantidadDisponible) || 0;
        const cantidadParcialNum = Number(prod.product.cantidadParcial) || 0;
        const availableStock = cantidadDisponibleNum + cantidadParcialNum - cantidadReservadaActiva;
        if (requestedQty > availableStock) {
          return { valid: false, product: prod.product.nombre, requested: requestedQty, available: availableStock, type: 'disponible' };
        }
      }
      return { valid: true };
    });

    const validationResults = await Promise.all(validationPromises);
    const invalidResults = validationResults.filter(result => !result.valid);

    if (invalidResults.length > 0) {
      const messages = invalidResults.map(result => {
        const stockType = result.type === 'parcial' ? 'parcial' : 'disponible';
        return `${result.product}: solicitado ${result.requested}, ${stockType} ${result.available}`;
      });
      showAlert('Stock insuficiente', `No hay suficiente stock para:\n${messages.join('\n')}`);
      setIsLoading(false);
      return;
    }

    const dateStr = selectedDate.toISOString().split('T')[0];
    const data = {
      fecha: dateStr,
      usuarios: selectedUsuarios.map(u => u.id),
      materiales: Object.values(selectedProducts).map(prod => ({ id: prod.product.id, nombre: prod.product.nombre, qty: prod.qty, isSurplus: prod.isSurplus })),
      categoria,
      descripcion,
      lote: selectedLote?.id
    };

    // En modo edición, solo validar campos editables
    if (activityToUpdate) {
      const editableData = {
        descripcion: data.descripcion,
        categoria: data.categoria,
        lote: data.lote
      };
      return editableData;
    }

    try {
      if (activityToUpdate) {
        // Update mode
        const updateData = {
          descripcion: data.descripcion,
          fkCultivoVariedadZonaId: selectedLote!.id,
          fkCategoriaActividadId: data.categoria,
        };

        // For now, just update the basic activity data
        // TODO: Implement proper update logic for users and materials
        console.log('Update data:', updateData);
        showAlert('Éxito', 'La actividad ha sido actualizada correctamente.', [
          { text: 'OK', onPress: () => {
            setAlertVisible(false);
            onActivityCreated();
            onClose();
          }}
        ]);

        // For update, we might need to handle user and product changes differently
        // For now, just update the basic activity data
        showAlert('Éxito', 'La actividad ha sido actualizada correctamente.', [
          { text: 'OK', onPress: () => {
            setAlertVisible(false);
            onActivityCreated();
            onClose();
          }}
        ]);
      } else {
        // Create mode
        const actividadData = {
          descripcion: data.descripcion,
          fechaAsignacion: selectedDate.toISOString(),
          horasDedicadas: 0,
          observacion: '',
          estado: true,
          fkCultivoVariedadZonaId: selectedLote!.id,
          fkCategoriaActividadId: data.categoria,
        };

        const actividad = await createActividad(actividadData);

        for (const userId of data.usuarios) {
          await createUsuarioXActividad({ fkUsuarioId: userId, fkActividadId: actividad.id, fechaAsignacion: selectedDate });
        }

        for (const mat of data.materiales) {
          await createReservationByProduct(actividad.id, { productId: mat.id, cantidadReservada: parseFloat(mat.qty) || 0 });
        }

        showAlert('Éxito', 'La actividad ha sido guardada correctamente.', [
          { text: 'OK', onPress: () => {
            setAlertVisible(false);
            onActivityCreated();
            onClose();
          }}
        ]);
      }
    } catch (error) {
      console.error('Error saving actividad:', error);
      showAlert('Error', 'Error al guardar la actividad');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSelect = (label: string, value: string, onChange: (value: string) => void, options: any[], placeholder: string) => (
    <View style={styles.selectContainer}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectScroll}>
        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[styles.selectOption, value === option.id && styles.selectedOption]}
            onPress={() => onChange(option.id)}
          >
            <Text style={[styles.selectOptionText, value === option.id && styles.selectedOptionText]}>
              {option.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {!value && <Text style={styles.placeholderText}>{placeholder}</Text>}
    </View>
  );

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
        
          <Text style={styles.title}>{activityToUpdate ? 'Actualizar Actividad' : 'Registrar Actividad'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {activityToUpdate && (
              <View style={[styles.section, { backgroundColor: '#fef3c7', padding: 12, borderRadius: 8, marginBottom: 16 }]}>
                <Text style={[styles.sectionTitle, { color: '#92400e', fontSize: 14 }]}>
                  ⚠️ Solo se pueden editar: Descripción, Categoría y Ubicación
                </Text>
                <Text style={{ fontSize: 12, color: '#78350f', marginTop: 4 }}>
                  Los usuarios asignados y productos reservados no se pueden modificar en esta versión.
                </Text>
              </View>
            )}

            {/* Usuarios */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Usuarios Asignados {activityToUpdate ? '(Solo lectura)' : ''}
              </Text>
              <CampoTexto
                etiqueta="Buscar Usuario"
                marcador="Escribe nombre o documento..."
                valor={usuarioSearch}
                alCambiar={setUsuarioSearch}
              />
              {debouncedUsuarioSearch.trim() && (
                <View style={styles.searchResults}>
                  {filteredUsuarios.length === 0 ? (
                    <Text style={styles.noResults}>No se encontraron usuarios</Text>
                  ) : (
                    <FlatList
                      data={filteredUsuarios.slice(0, 10)}
                      keyExtractor={(item, index) => item.id || `user-${index}`}
                      scrollEnabled={false}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.searchItem}
                          onPress={() => handleSelectUsuario(item)}
                        >
                          <Text style={styles.searchItemText}>
                            N. Documento: {item.dni || 'N/A'}
                          </Text>
                          <Text style={styles.searchItemSubtext}>
                            Nombres: {item.nombres || item.apellidos
                              ? `${item.nombres || ''} ${item.apellidos || ''}`.trim()
                              : 'Sin nombre'
                            }
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  )}
                </View>
              )}
              <View style={styles.selectedContainer}>
                {selectedUsuarios.map((usuario, index) => (
                  <View key={`usuario-${index}`} style={styles.chip}>
                    <Text style={styles.chipText}>
                      {usuario.nombres || usuario.apellidos
                        ? `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim()
                        : `DNI: ${usuario.dni || 'N/A'}`
                      }
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveUsuario(usuario.id)}>
                      <Text style={styles.chipRemove}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              {errors.usuarios && <Text style={styles.errorText}>{errors.usuarios}</Text>}
            </View>

            {/* Productos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Reservar productos {activityToUpdate ? '(Solo lectura)' : ''}
              </Text>
              <CampoTexto
                etiqueta="Buscar productos"
                marcador="Escribe para buscar..."
                valor={productSearch}
                alCambiar={setProductSearch}
              />
              {debouncedProductSearch.trim() && (
                <View style={[styles.searchResults, { zIndex: 1000, elevation: 10 }]}>
                  {filteredProducts.length === 0 ? (
                    <Text style={styles.noResults}>No se encontraron productos</Text>
                  ) : (
                    <FlatList
                      data={filteredProducts.slice(0, 10)}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.searchItem}
                          onPress={() => handleSelectProduct(item)}
                        >
                          <Text style={styles.searchItemText}>{item.nombre}</Text>
                          <Text style={styles.searchItemSubtext}>
                            Disponible: {(item as any).cantidadDisponibleReal || item.cantidadDisponible} {item.unidadMedida?.abreviatura}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  )}
                </View>
              )}
              <View style={styles.selectedProducts}>
                {Object.values(selectedProducts).map((prod) => {
                  const hasSurplus = (prod.product.stock_parcial || 0) > 0;
                  let cantidadReservadaActiva = 0;
                  if (prod.product.reservas) {
                    for (const reserva of prod.product.reservas) {
                      if (reserva.estado && reserva.estado.nombre !== 'Confirmada') {
                        cantidadReservadaActiva += (reserva.cantidadReservada || 0) - (reserva.cantidadDevuelta || 0);
                      }
                    }
                  }
                  const cantidadDisponibleNum = Number(prod.product.cantidadDisponible) || 0;
                  const cantidadParcialNum = Number(prod.product.cantidadParcial) || 0;
                  const availableStock = cantidadDisponibleNum + cantidadParcialNum - cantidadReservadaActiva;
                  const isOverLimit = (parseFloat(prod.qty) || 0) > availableStock;
                  return (
                    <View key={prod.product.id} style={styles.productItem}>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{prod.product.nombre}</Text>
                        <Text style={styles.productStock}>
                          Disponible: {Math.max(0, availableStock)} {prod.product.unidadMedida?.abreviatura}
                        </Text>
                      </View>
                      <CampoTexto
                        etiqueta="Cantidad"
                        valor={prod.qty.toString()}
                        alCambiar={(value) => {
                          // Reemplazar , con . para permitir separador decimal español
                          const normalizedValue = value.replace(',', '.');
                          // Permitir decimales solo para productos divisibles (semillas, pesticidas, etc.)
                          // Para herramientas, solo enteros
                          const esDivisible = prod.product.categoria?.esDivisible ?? true;
                          let regex;
                          if (esDivisible) {
                            // Permitir decimales: números enteros o con punto decimal (no iniciar con .)
                            regex = /^\d+\.?\d*$/;
                          } else {
                            // Solo enteros para herramientas
                            regex = /^\d+$/;
                          }
                          if (regex.test(normalizedValue) || normalizedValue === '') {
                            handleQtyChange(prod.product.id, normalizedValue);
                          }
                        }}
                        marcador="0"
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleSelectProduct(prod.product)}
                      >
                        <Text style={styles.removeText}>×</Text>
                      </TouchableOpacity>
                      {isOverLimit && <Text style={styles.overLimitText}>Excede stock</Text>}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Formulario */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detalles de la Actividad</Text>

              {renderSelect(
                'Categoría',
                categoria,
                setCategoria,
                categorias,
                'Seleccionar categoría'
              )}
              {errors.categoria && <Text style={styles.errorText}>{errors.categoria}</Text>}

              <CampoTexto
                etiqueta="Descripción"
                marcador="Escriba..."
                valor={descripcion}
                alCambiar={setDescripcion}
                multiline
                numberOfLines={3}
              />
              {errors.descripcion && <Text style={styles.errorText}>{errors.descripcion}</Text>}

              <CampoTexto
                etiqueta="Buscar lote"
                marcador="Escribe para buscar..."
                valor={loteSearch}
                alCambiar={setLoteSearch}
              />
              {debouncedLoteSearch.trim() && (
                <View style={[styles.searchResults, { zIndex: 1000, elevation: 10 }]}>
                  {filteredZonas.length === 0 ? (
                    <Text style={styles.noResults}>No se encontraron lotes</Text>
                  ) : (
                    <FlatList
                      data={filteredZonas}
                      keyExtractor={(item, index) => item.id || `lote-${index}`}
                      scrollEnabled={false}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.searchItem}
                          onPress={() => handleSelectLote(item)}
                        >
                          <Text style={styles.searchItemText}>{item.nombre}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  )}
                </View>
              )}
              <View style={styles.selectedContainer}>
                {selectedLote && (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{selectedLote.nombre}</Text>
                    <TouchableOpacity onPress={handleRemoveLote}>
                      <Text style={styles.chipRemove}>×</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              {errors.lote && <Text style={styles.errorText}>{errors.lote}</Text>}

              <View style={styles.buttonContainer}>
                {!isInitializing && hasPermission('Actividades', 'actividades', activityToUpdate ? 'actualizar' : 'crear') && (
                  <Boton
                    text={isLoading ? "Guardando..." : (activityToUpdate ? "Actualizar actividad" : "Guardar actividad")}
                    onClick={handleSave}
                    disabled={isLoading}
                  />
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      <CustomAlertModal
        isVisible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onBackdropPress={() => setAlertVisible(false)}
      />
    </Modal>
  );
});

ActividadModalO.displayName = 'ActividadModalO';

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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  searchResults: {
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginTop: 8,
    position: 'relative',
  },
  searchItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  searchItemSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  noResults: {
    padding: 12,
    textAlign: 'center',
    color: '#6b7280',
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
  },
  chipRemove: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  selectedProducts: {
    marginTop: 8,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  productStock: {
    fontSize: 12,
    color: '#6b7280',
  },
  removeButton: {
    padding: 8,
  },
  removeText: {
    fontSize: 20,
    color: '#ef4444',
  },
  overLimitText: {
    fontSize: 12,
    color: '#ef4444',
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  selectContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  selectScroll: {
    marginBottom: 8,
  },
  selectOption: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  selectedOption: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedOptionText: {
    color: '#ffffff',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
});

export default ActividadModalO;