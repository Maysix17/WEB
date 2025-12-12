import { Stack } from 'expo-router';

export default function ActividadesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="ActividadesPage"
        options={{
          title: 'Actividades',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HistorialActividadesPage"
        options={{
          title: 'Historial de Actividades',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DashboardPage"
        options={{
          title: 'Dashboard de Actividades',
          headerShown: false,
        }}
      />
    </Stack>
  );
}