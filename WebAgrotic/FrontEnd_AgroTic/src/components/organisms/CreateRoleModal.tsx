import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Switch, Card, CardHeader, CardBody } from '@heroui/react';
import CustomButton from '../atoms/Boton';
import { getModulos, createRole, updateRole, assignPermissionsToRole } from '../../services/rolesService';

interface Modulo {
  id: string;
  nombre: string;
  recursos: Recurso[];
}

interface Recurso {
  id: string;
  nombre: string;
  permisos: Permiso[];
}

interface Permiso {
  id: string;
  accion: string;
}

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleCreated: () => void;
  editingRole?: any;
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ isOpen, onClose, onRoleCreated, editingRole }) => {
  const [roleName, setRoleName] = useState('');
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchModulos();
      if (editingRole) {
        setRoleName(editingRole.nombre);
        // Pre-select permissions
        const selectedPerms = new Set<string>(editingRole.permisos.map((p: any) => p.id as string));
        setSelectedPermissions(selectedPerms);
        // Pre-select modules and resources based on permissions
        const selectedMods = new Set<string>();
        const selectedRes = new Set<string>();
        editingRole.permisos.forEach((perm: any) => {
          if (perm.recurso && perm.recurso.modulo) {
            selectedMods.add(perm.recurso.modulo.id);
            selectedRes.add(perm.recurso.id);
          }
        });
        setSelectedModules(selectedMods);
        setSelectedResources(selectedRes);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingRole]);

  const fetchModulos = async () => {
    setLoading(true);
    try {
      const data = await getModulos();
      setModulos(data);
    } catch (error) {
      console.error('Error fetching modulos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = (moduleId: string, checked: boolean) => {
    const newSelected = new Set(selectedModules);
    if (checked) {
      newSelected.add(moduleId);
    } else {
      newSelected.delete(moduleId);
      // Remove associated resources and permissions
      const module = modulos.find(m => m.id === moduleId);
      if (module) {
        module.recursos.forEach(recurso => {
          selectedResources.delete(recurso.id);
          recurso.permisos.forEach(permiso => {
            selectedPermissions.delete(permiso.id);
          });
        });
      }
    }
    setSelectedModules(newSelected);
  };

  const handleResourceToggle = (resourceId: string, checked: boolean) => {
    const newSelected = new Set(selectedResources);
    if (checked) {
      newSelected.add(resourceId);
    } else {
      newSelected.delete(resourceId);
      // Remove associated permissions
      const recurso = modulos.flatMap(m => m.recursos).find(r => r.id === resourceId);
      if (recurso) {
        recurso.permisos.forEach(permiso => {
          selectedPermissions.delete(permiso.id);
        });
      }
    }
    setSelectedResources(newSelected);
  };

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    const newSelected = new Set(selectedPermissions);
    if (checked) {
      newSelected.add(permissionId);
    } else {
      newSelected.delete(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleCreateRole = async () => {
    if (!roleName.trim()) return;
    if (selectedPermissions.size === 0) return;

    setCreating(true);
    try {
      if (editingRole) {
        // Update role
        await updateRole(editingRole.id, {
          nombre: roleName,
          permisoIds: Array.from(selectedPermissions),
        });
      } else {
        // Create role
        const roleResponse = await createRole({ nombre: roleName });
        const roleId = roleResponse.id;

        // Assign permissions
        await assignPermissionsToRole(roleId, {
          permisoIds: Array.from(selectedPermissions),
        });
      }

      onRoleCreated();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving role:', error);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setRoleName('');
    setSelectedModules(new Set());
    setSelectedResources(new Set());
    setSelectedPermissions(new Set());
  };

  const activePermissionsCount = selectedPermissions.size;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>{editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Nombre del rol"
              placeholder="Ej. Supervisor"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />

            {loading ? (
              <div>Cargando módulos...</div>
            ) : (
              <div className="space-y-4">
                {modulos.filter(modulo => modulo.recursos.length > 0).map((modulo) => (
                  <Card key={modulo.id}>
                    <CardHeader className="flex justify-between">
                      <div>
                        <h3 className="font-bold">{modulo.nombre}</h3>
                        <p className="text-sm text-gray-600">Módulo principal</p>
                      </div>
                      <Switch
                        size="md"
                        isSelected={selectedModules.has(modulo.id)}
                        onValueChange={(checked) => handleModuleToggle(modulo.id, checked)}
                      />
                    </CardHeader>
                    {selectedModules.has(modulo.id) && (
                      <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {modulo.recursos.map((recurso) => (
                            <Card key={recurso.id} className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold">{recurso.nombre}</h4>
                                  <p className="text-sm text-gray-600">Recurso</p>
                                </div>
                                <Switch
                                  size="md"
                                  isSelected={selectedResources.has(recurso.id)}
                                  onValueChange={(checked) => handleResourceToggle(recurso.id, checked)}
                                />
                              </div>
                              {selectedResources.has(recurso.id) && (
                                <div className="space-y-2">
                                  {recurso.permisos.map((permiso) => (
                                    <label key={permiso.id} className="flex items-center space-x-2">
                                      <Switch
                                        size="md"
                                        isSelected={selectedPermissions.has(permiso.id)}
                                        onValueChange={(checked) => handlePermissionToggle(permiso.id, checked)}
                                      />
                                      <span className="text-sm">{permiso.accion}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </CardBody>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-between w-full">
            <div>Permisos activos: {activePermissionsCount}</div>
            <div className="space-x-2">
              <CustomButton variant="bordered" onClick={onClose} label="Cancelar" />
              <CustomButton
                color="primary"
                onClick={handleCreateRole}
                disabled={creating || !roleName.trim() || activePermissionsCount === 0}
                label={editingRole ? 'Actualizar Rol' : 'Guardar Rol'}
              />
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateRoleModal;