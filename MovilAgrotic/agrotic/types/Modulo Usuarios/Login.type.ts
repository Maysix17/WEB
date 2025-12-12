export type LoginProps = {
    
    /** El valor actual del campo DNI. */
    dni: string;
    
    /** Función para actualizar el DNI. En RN, las funciones de estado
     * reciben el valor directamente (string).
     */
    setDni: (value: string) => void;

    /** El valor actual del campo Contraseña. */
    password: string;
    onGoToRegistro?: () => void; 
    
    /** Función para actualizar la Contraseña. */
    setPassword: (value: string) => void;
};