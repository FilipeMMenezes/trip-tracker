import React, { useState, useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getAllTrips, deleteTrip } from '../../src/db/tripRepository';
import TripHistoryCard from '../../src/components/TripHistoryCard';
import { Trip } from '../../src/types/trip';

export default function HistoryScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      getAllTrips().then(setTrips);
    }, [])
  );

  const handleDelete = async (id: string) => {
    await deleteTrip(id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.header}>Trip History</Text>

      {trips.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No trips yet</Text>
          <Text style={styles.emptyHint}>
            Start a trip from the Track tab to see it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TripHistoryCard
              trip={item}
              onPress={() => router.push(`/trip/${item.id}`)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyHint: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
