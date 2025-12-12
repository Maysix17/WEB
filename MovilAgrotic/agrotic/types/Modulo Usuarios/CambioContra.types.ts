export type ResetPasswordProps = {
    /** El valor actual del campo Nueva Contraseña. */
    newPassword?: string;
    /** Función para actualizar el estado de Nueva Contraseña. */
    setNewPassword?: (value: string) => void;
    /** El valor actual del campo Confirmar Contraseña. */
    confirmPassword?: string;
    /** Función para actualizar el estado de Confirmar Contraseña. */
    setConfirmPassword?: (value: string) => void;
};