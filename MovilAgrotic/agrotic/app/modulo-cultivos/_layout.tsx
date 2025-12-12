import { Stack } from 'expo-router';

export default function CultivosLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="CultivosPage"
        options={{
          title: 'Cultivos',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TipoCultivoPage"
        options={{
          title: 'Tipo de Cultivo',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="VariedadPage"
        options={{
          title: 'Variedades',
          headerShown: false,
        }}
      />
    </Stack>
  );
}