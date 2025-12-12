/**
 * Utility functions for handling errors in a user-friendly way
 */

/**
 * Handles deletion errors and returns user-friendly messages
 * @param error - The error object from API call
 * @param entityName - The name of the entity being deleted (e.g., "tipo de cultivo", "variedad")
 * @returns User-friendly error message
 */
export const handleDeletionError = (error: any, entityName: string): string => {
  // If it's an Axios error (most common case)
  if (error?.response) {
    const { status, data } = error.response;
    
    // Handle foreign key constraint violations (status 400)
    if (status === 400) {
      // Check if it's a foreign key constraint error
      const message = data?.message || data?.error || '';
      
      if (message.toLowerCase().includes('foreign key') || 
          message.toLowerCase().includes('constraint') ||
          message.toLowerCase().includes('violates')) {
        return `No se puede eliminar este ${entityName} porque tiene registros asociados. Para eliminarlo, primero debe eliminar o reasignar los registros que lo utilizan.`;
      }
      
      // Handle other 400 errors
      return `No se puede eliminar el ${entityName} seleccionado. Verifique que no tenga dependencias asociadas.`;
    }
    
    // Handle other common HTTP status codes
    switch (status) {
      case 401:
        return 'No tiene permisos para eliminar este elemento.';
      case 403:
        return 'No tiene permisos para eliminar este elemento.';
      case 404:
        return `El ${entityName} no existe o ya fue eliminado.`;
      case 500:
        return 'Error interno del servidor. Intente nuevamente más tarde.';
      default:
        return `Error al eliminar el ${entityName}: ${data?.message || 'Error desconocido'}`;
    }
  }
  
  // Handle network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message === 'Network Error') {
    return 'Error de conexión. Verifique su conexión a internet e intente nuevamente.';
  }
  
  // Handle timeout errors
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'La operación tardó demasiado. Intente nuevamente.';
  }
  
  // Handle generic errors
  return error?.message || `Error inesperado al eliminar el ${entityName}`;
};

/**
 * Checks if an error is a foreign key constraint violation
 * @param error - The error object from API call
 * @returns true if it's a foreign key constraint error
 */
export const isForeignKeyError = (error: any): boolean => {
  if (error?.response?.status === 400) {
    const message = error.response.data?.message || error.response.data?.error || '';
    return message.toLowerCase().includes('foreign key') || 
           message.toLowerCase().includes('constraint') ||
           message.toLowerCase().includes('violates');
  }
  return false;
};

/**
 * Gets a friendly error message for different types of errors
 * @param error - The error object
 * @param context - Context of the operation (create, update, delete, etc.)
 * @param entityType - Type of entity (cultivo, variedad, estado, etc.)
 * @returns User-friendly error message
 */
export const getFriendlyErrorMessage = (
  error: any, 
  context: 'create' | 'update' | 'delete' | 'fetch',
  entityType: string
): string => {
  const entityNames: Record<string, string> = {
    'tipo-cultivo': 'tipo de cultivo',
    'variedad': 'variedad',
    'estado-fenologico': 'estado fenológico',
    'cultivo': 'cultivo',
    'cosecha': 'cosecha',
    'venta': 'venta'
  };

  const friendlyEntityName = entityNames[entityType] || entityType;

  if (context === 'delete') {
    return handleDeletionError(error, friendlyEntityName);
  }

  // Handle other operation errors
  if (error?.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return `No se pudo ${context === 'create' ? 'crear' : context === 'update' ? 'actualizar' : 'procesar'} el ${friendlyEntityName}. Verifique que los datos sean correctos.`;
      case 401:
        return 'No tiene permisos para realizar esta operación.';
      case 403:
        return 'No tiene permisos para realizar esta operación.';
      case 404:
        return `El ${friendlyEntityName} no fue encontrado.`;
      case 422:
        return data?.message || `Error de validación al ${context === 'create' ? 'crear' : 'actualizar'} el ${friendlyEntityName}.`;
      case 500:
        return 'Error interno del servidor. Intente nuevamente más tarde.';
      default:
        return data?.message || `Error al ${context === 'create' ? 'crear' : context === 'update' ? 'actualizar' : 'procesar'} el ${friendlyEntityName}`;
    }
  }

  // Handle network and other errors
  if (error?.code === 'NETWORK_ERROR') {
    return 'Error de conexión. Verifique su conexión a internet.';
  }

  return error?.message || `Error inesperado al ${context === 'create' ? 'crear' : context === 'update' ? 'actualizar' : 'procesar'} el ${friendlyEntityName}`;
};