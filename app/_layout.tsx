import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { getDatabase } from '../src/db/database';

export default function RootLayout() {
  useEffect(() => {
    getDatabase();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="trip/[id]"
        options={{
          presentation: 'modal',
          headerShown: true,
          headerStyle: { backgroundColor: '#1C1C1E' },
          headerTintColor: '#007AFF',
          headerTitleStyle: { color: '#FFF' },
          title: 'Trip Detail',
        }}
      />
    </Stack>
  );
}
