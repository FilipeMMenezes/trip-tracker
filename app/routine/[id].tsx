import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getRoutineById, deleteRoutine } from '../../src/db/routineRepository';
import { getTripsForRoutine } from '../../src/db/tripRepository';
import { analyzeRoutine } from '../../src/utils/trafficAnalysis';
import { cancelRoutineNotification, scheduleDepartureReminder } from '../../src/utils/notifications';
import CommuteSuggestionCard from '../../src/components/CommuteSuggestionCard';
import { Routine, DepartureRecommendation } from '../../src/types/routine';
import { Trip } from '../../src/types/trip';
import { formatDate, formatTime, formatDuration } from '../../src/utils/tripUtils';

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [recommendation, setRecommendation] = useState<DepartureRecommendation | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const [r, t] = await Promise.all([getRoutineById(id), getTripsForRoutine(id)]);
    if (!r) return;

    const rec = analyzeRoutine(r, t);
    setRoutine(r);
    setTrips(t);
    setRecommendation(rec);

    if (rec.unlocked) {
      await scheduleDepartureReminder(r, rec);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    if (routine) {
      navigation.setOptions({ title: routine.name });
    }
  }, [routine, navigation]);

  const handleDelete = () => {
    if (!routine) return;
    Alert.alert(
      'Delete Routine',
      `Delete "${routine.name}"? This won't delete your recorded trips.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await cancelRoutineNotification(routine.id);
            await deleteRoutine(routine.id);
            router.back();
          },
        },
      ]
    );
  };

  if (!routine || !recommendation) return <View style={styles.root} />;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Recommendation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Smart Departure</Text>
        <CommuteSuggestionCard recommendation={recommendation} tripCount={trips.length} />
      </View>

      {/* Routine details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailCard}>
          <DetailRow label="Arrive by" value={routine.arrivalTime} />
          <DetailRow
            label="Destination"
            value={routine.destinationLabel ?? `${routine.destinationLat.toFixed(4)}, ${routine.destinationLng.toFixed(4)}`}
          />
          <DetailRow label="Match radius" value={`${routine.matchRadiusMeters >= 1000 ? `${routine.matchRadiusMeters / 1000} km` : `${routine.matchRadiusMeters} m`}`} />
          <DetailRow label="Total matched trips" value={trips.length.toString()} last />
        </View>
      </View>

      {/* Matched trips */}
      {trips.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Matched Trips</Text>
          {trips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripRow}
              onPress={() => router.push(`/trip/${trip.id}`)}
              activeOpacity={0.75}
            >
              <View>
                <Text style={styles.tripDate}>{formatDate(trip.startedAt)}</Text>
                <Text style={styles.tripMeta}>
                  {formatTime(trip.startedAt)} · {trip.distanceMiles.toFixed(2)} mi · {formatDuration(trip.durationSeconds)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#636366" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Delete */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
        <Text style={styles.deleteLabel}>Delete Routine</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  detailCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  detailRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  detailLabel: {
    color: '#8E8E93',
    fontSize: 15,
  },
  detailValue: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
  },
  tripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tripDate: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 3,
  },
  tripMeta: {
    color: '#8E8E93',
    fontSize: 13,
  },
  deleteButton: {
    marginTop: 8,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,59,48,0.3)',
  },
  deleteLabel: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '600',
  },
});
