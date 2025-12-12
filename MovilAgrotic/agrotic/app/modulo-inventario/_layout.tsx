import { Stack } from 'expo-router';

export default function InventarioLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="InventarioPage"
        options={{
          title: 'Inventario',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MovimientosPage"
        options={{
          title: 'Movimientos',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProductDetailPage"
        options={{
          title: 'Detalle de Producto',
          headerShown: false,
        }}
      />
    </Stack>
  );
}