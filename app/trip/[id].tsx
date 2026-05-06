import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { getTripById } from '../../src/db/tripRepository';
import { Trip } from '../../src/types/trip';
import { formatDuration, formatDate, formatTime } from '../../src/utils/tripUtils';
import TripMap from '../../src/components/TripMap';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (id) getTripById(id).then(setTrip);
  }, [id]);

  useEffect(() => {
    if (trip) {
      navigation.setOptions({ title: formatDate(trip.startedAt) });
    }
  }, [trip, navigation]);

  if (!trip) return <View style={styles.root} />;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.mapContainer}>
        <TripMap
          currentLocation={null}
          coordinates={trip.coordinates}
          isTracking={false}
        />
      </View>

      <View style={styles.stats}>
        <Text style={styles.timeLabel}>{formatTime(trip.startedAt)}</Text>
        <StatRow label="Distance" value={`${trip.distanceMiles.toFixed(2)} mi`} />
        <StatRow label="Duration" value={formatDuration(trip.durationSeconds)} />
        <StatRow label="Max Speed" value={`${Math.round(trip.maxSpeedMph)} mph`} />
        <StatRow label="Avg Speed" value={`${Math.round(trip.avgSpeedMph)} mph`} />
      </View>
    </ScrollView>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    paddingBottom: 40,
  },
  mapContainer: {
    height: 300,
    overflow: 'hidden',
  },
  stats: {
    padding: 20,
  },
  timeLabel: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 16,
  },
  statValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
