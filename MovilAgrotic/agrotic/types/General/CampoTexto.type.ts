// /types/CampoTexto.types.ts

import { TextInputProps } from 'react-native';

// La interfaz hereda todas las propiedades del <TextInput> nativo de RN
export interface CampoTextoProps extends TextInputProps {
    /** * Etiqueta del campo (RN usa <Text> para la etiqueta).
     * Mantiene la misma funcionalidad.
     */
    etiqueta: string;
    
    /** * El valor actual del input.
     * Mantiene la misma funcionalidad.
     */
    valor: string;
    
    /** * FUNCIÓN CRUCIAL: En RN, onChangeText envía el texto (string) directamente, 
     * no el evento (ChangeEvent).
     */
    alCambiar: (text: string) => void;

    /** * Tipo de input. Mantenemos el tipo web simple y lo mapeamos 
     * internamente a 'keyboardType' y 'secureTextEntry'.
     */
    tipo?: 'text' | 'password' | 'email' | 'number';
    
    /** * Texto de marcador de posición (placeholder).
     * Mantiene la misma funcionalidad.
     */
    marcador?: string;

    /** * Propiedad para NativeWind. Usamos 'className' que hereda de TextInputProps.
     * Mantenemos 'clasesExtra' por consistencia con tu proyecto original, 
     * pero la mapearemos a 'className' en el componente.
     */
    clasesExtra?: string; 

    // ¡Se elimina la importación de ChangeEvent!
}