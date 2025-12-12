export type RegistroProps = {
    
    /** El valor actual del campo Nombres. */
    nombres?: string;
    /** Función para actualizar el estado de Nombres. */
    setNombres?: (value: string) => void;

    /** El valor actual del campo Apellidos. */
    apellidos?: string;
    /** Función para actualizar el estado de Apellidos. */
    setApellidos?: (value: string) => void;

    /** El valor actual del campo DNI. */
    dni?: string;
    /** Función para actualizar el estado de DNI. */
    setDni?: (value: string) => void;

    /** El valor actual del campo Teléfono. */
    telefono?: string;
    /** Función para actualizar el estado de Teléfono. */
    setTelefono?: (value: string) => void;

    /** El valor actual del campo Email. */
    email?: string;
    /** Función para actualizar el estado de Email. */
    setEmail?: (value: string) => void;

    /** El valor actual del campo Contraseña. */
    password?: string;
    /** Función para actualizar el estado de Contraseña. */
    setPassword?: (value: string) => void;

    // Puedes añadir una propiedad para el manejo de errores o de envío (onSubmit) aquí
};