import { Stack } from 'expo-router';

export default function IOTLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="IOTPage"
        options={{
          title: 'Sensores IoT',
          headerShown: false,
        }}
      />
    </Stack>
  );
}