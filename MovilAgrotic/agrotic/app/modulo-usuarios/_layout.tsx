import { Stack } from 'expo-router';

export default function UsuariosLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="LoginPage"
        options={{
          title: 'Iniciar Sesión',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RegistroPage"
        options={{
          title: 'Registro',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RecuperarPage"
        options={{
          title: 'Recuperar Contraseña',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProfilePage"
        options={{
          title: 'Perfil',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CambioContraPage"
        options={{
          title: 'Cambiar Contraseña',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PanelControlPage"
        options={{
          title: 'Panel de Control',
          headerShown: false,
        }}
      />
    </Stack>
  );
}