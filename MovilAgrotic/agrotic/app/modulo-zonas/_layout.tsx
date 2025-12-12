import { Stack } from 'expo-router';

export default function ZonasLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="ZonasPage"
        options={{
          title: 'Zonas',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ZonaPage"
        options={{
          title: 'Zona',
          headerShown: false,
        }}
      />
    </Stack>
  );
}