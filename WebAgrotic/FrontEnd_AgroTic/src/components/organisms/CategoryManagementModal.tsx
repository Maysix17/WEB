import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, Button } from '@heroui/react';
import CustomButton from '../atoms/Boton';
import Swal from 'sweetalert2';
import { categoriaService, registerCategoria, updateCategoria, deleteCategoria } from '../../services/categoriaService';
import type { CategoriaData } from '../../types/categoria.types';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated: () => void;
}

const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  isOpen,
  onClose,
  onCategoryCreated,
}) => {
  const [categories, setCategories] = useState<CategoriaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoriaData | null>(null);

  // Form data for category
  const [categoryFormData, setCategoryFormData] = useState({
    nombre: '',
    esDivisible: false,
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriaService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Swal.fire('Error', 'No se pudieron cargar las categorías.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerCategoria(categoryFormData);
      Swal.fire('Éxito', 'Categoría creada exitosamente.', 'success');
      setCategoryFormData({ nombre: '', esDivisible: false });
      setIsCreateModalOpen(false);
      fetchCategories();
      onCategoryCreated();
    } catch (error: any) {
      console.error('Error creating category:', error);
      Swal.fire('Error', error.response?.data?.message || 'No se pudo crear la categoría.', 'error');
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory?.id) return;

    try {
      await updateCategoria(selectedCategory.id, categoryFormData);
      Swal.fire('Éxito', 'Categoría actualizada exitosamente.', 'success');
      setCategoryFormData({ nombre: '', esDivisible: false });
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      fetchCategories();
      onCategoryCreated();
    } catch (error: any) {
      console.error('Error updating category:', error);
      Swal.fire('Error', error.response?.data?.message || 'No se pudo actualizar la categoría.', 'error');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer y puede afectar productos existentes.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await deleteCategoria(categoryId);
        Swal.fire('Eliminado', 'La categoría ha sido eliminada.', 'success');
        fetchCategories();
        onCategoryCreated();
      } catch (error: any) {
        console.error('Error deleting category:', error);
        Swal.fire('Error', error.response?.data?.message || 'No se pudo eliminar la categoría.', 'error');
      }
    }
  };

  const openEditModal = (category: CategoriaData) => {
    setSelectedCategory(category);
    setCategoryFormData({
      nombre: category.nombre,
      esDivisible: category.esDivisible,
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setCategoryFormData({ nombre: '', esDivisible: false });
    setSelectedCategory(null);
  };

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onClose} size="4xl">
        <ModalContent className="bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Gestión de Categorías</h2>
            <CustomButton onClick={() => setIsCreateModalOpen(true)}>
              Crear Categoría
            </CustomButton>
          </div>

          {loading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : (
            <div className="space-y-4">
              {categories.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No hay categorías registradas.
                </div>
              ) : (
                <div className="grid gap-4">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-semibold">{category.nombre}</h3>
                        <p className="text-sm text-gray-600">
                          {category.esDivisible ? 'Es divisible' : 'No es divisible'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="light"
                          onClick={() => openEditModal(category)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onClick={() => category.id && handleDeleteCategory(category.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button onClick={onClose} variant="light">
              Cerrar
            </Button>
          </div>
        </ModalContent>
      </Modal>

      {/* Create Category Modal */}
      <Modal isOpen={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} size="md">
        <ModalContent className="bg-white p-6">
          <h3 className="text-xl font-bold mb-4">Crear Nueva Categoría</h3>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={categoryFormData.nombre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="esDivisible"
                checked={categoryFormData.esDivisible}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">
                Es divisible
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
                variant="light"
              >
                Cancelar
              </Button>
              <CustomButton type="submit">Crear</CustomButton>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Category Modal */}
      <Modal isOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen} size="md">
        <ModalContent className="bg-white p-6">
          <h3 className="text-xl font-bold mb-4">Editar Categoría</h3>
          <form onSubmit={handleEditCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={categoryFormData.nombre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="esDivisible"
                checked={categoryFormData.esDivisible}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">
                Es divisible
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                }}
                variant="light"
              >
                Cancelar
              </Button>
              <CustomButton type="submit">Actualizar</CustomButton>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CategoryManagementModal;