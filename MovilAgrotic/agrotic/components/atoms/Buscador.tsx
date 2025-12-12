import React, { useState, useEffect } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface BuscadorProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    // Opcional: para permitir la búsqueda sin debounce si es necesario
    debounceDelay?: number; 
}

const Buscador: React.FC<BuscadorProps> = ({ 
    placeholder, 
    value, 
    onChangeText, 
    debounceDelay = 300 
}) => {
    const [searchTerm, setSearchTerm] = useState(value);

    // Actualiza el valor interno si el valor de la prop cambia (ej: al seleccionar un resultado)
    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    // La lógica de Debounce: solo llama a onChangeText (la prop del padre) después del retraso
    useEffect(() => {
        const handler = setTimeout(() => {
            onChangeText(searchTerm);
        }, debounceDelay);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, debounceDelay, onChangeText]);

    return (
        <View style={styles.container}>
            <MaterialCommunityIcons name="magnify" size={20} color="#6c757d" style={styles.icon} />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={searchTerm}
                onChangeText={setSearchTerm} // Cambia el estado interno inmediatamente
                placeholderTextColor="#6c757d"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 6,
        backgroundColor: '#fff',
        height: 40,
    },
    icon: {
        marginLeft: 10,
        marginRight: 5,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        paddingRight: 10,
    },
});

export default Buscador;