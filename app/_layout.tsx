import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { getDatabase } from '../src/db/database';
import { requestNotificationPermissions } from '../src/utils/notifications';

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      await getDatabase();
      await requestNotificationPermissions();
    })();
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
      <Stack.Screen
        name="routine/add"
        options={{
          presentation: 'modal',
          headerShown: true,
          headerStyle: { backgroundColor: '#1C1C1E' },
          headerTintColor: '#007AFF',
          headerTitleStyle: { color: '#FFF' },
          title: 'New Routine',
        }}
      />
      <Stack.Screen
        name="routine/[id]"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#1C1C1E' },
          headerTintColor: '#007AFF',
          headerTitleStyle: { color: '#FFF' },
          title: 'Routine Detail',
        }}
      />
    </Stack>
  );
}
