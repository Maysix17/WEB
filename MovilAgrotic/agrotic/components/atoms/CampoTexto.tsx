import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { CampoTextoProps } from '../../types/General/CampoTexto.type';

const CampoTexto: React.FC<CampoTextoProps> = ({ etiqueta, valor, alCambiar, tipo = 'text', marcador, style, ...rest }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{etiqueta}</Text>
      <TextInput
        style={[styles.input, style]}
        value={valor}
        onChangeText={alCambiar}
        placeholder={marcador}
        secureTextEntry={tipo === 'password'}
        keyboardType={tipo === 'number' ? 'numeric' : 'default'}
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
    width: '100%',
  },
});

export default CampoTexto;