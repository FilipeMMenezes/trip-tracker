import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Trip } from '../types/trip';
import { Routine } from '../types/routine';
import { formatDuration, formatDate, formatTime } from '../utils/tripUtils';
import { saveTrip } from '../db/tripRepository';
import { getAllRoutines } from '../db/routineRepository';
import { getTripsForRoutine } from '../db/tripRepository';
import { matchTripToRoutine } from '../utils/routineMatching';
import { analyzeRoutine } from '../utils/trafficAnalysis';
import { scheduleDepartureReminder } from '../utils/notifications';

interface Props {
  trip: Trip | null;
  onSave: () => void;
  onDiscard: () => void;
}

export default function TripSummaryModal({ trip, onSave, onDiscard }: Props) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (trip) {
      getAllRoutines().then(setRoutines);
    }
  }, [trip]);

  if (!trip) return null;

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const matchedRoutine = matchTripToRoutine(trip.coordinates, routines);
      const lastCoord = trip.coordinates[trip.coordinates.length - 1];

      const enrichedTrip: Trip = {
        ...trip,
        ...(matchedRoutine && lastCoord
          ? {
              routineId: matchedRoutine.id,
              destinationLat: lastCoord.latitude,
              destinationLng: lastCoord.longitude,
            }
          : {}),
      };

      await saveTrip(enrichedTrip);

      // Recompute and reschedule notification if a routine was matched
      if (matchedRoutine) {
        const routineTrips = await getTripsForRoutine(matchedRoutine.id);
        const recommendation = analyzeRoutine(matchedRoutine, routineTrips);
        if (recommendation.unlocked) {
          await scheduleDepartureReminder(matchedRoutine, recommendation);
        }
      }
    } finally {
      setIsSaving(false);
      onSave();
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.root}>
        <Text style={styles.title}>Trip Complete</Text>
        <Text style={styles.date}>
          {formatDate(trip.startedAt)} · {formatTime(trip.startedAt)}
        </Text>

        <View style={styles.stats}>
          <StatRow label="Distance" value={`${trip.distanceMiles.toFixed(2)} mi`} />
          <StatRow label="Duration" value={formatDuration(trip.durationSeconds)} />
          <StatRow label="Max Speed" value={`${Math.round(trip.maxSpeedMph)} mph`} />
          <StatRow label="Avg Speed" value={`${Math.round(trip.avgSpeedMph)} mph`} />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.savingButton]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveLabel}>Save Trip</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.discardButton}
            onPress={onDiscard}
            activeOpacity={0.8}
            disabled={isSaving}
          >
            <Text style={styles.discardLabel}>Discard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
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
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  date: {
    color: '#8E8E93',
    fontSize: 15,
    marginBottom: 32,
  },
  stats: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 32,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
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
  actions: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  savingButton: {
    opacity: 0.7,
  },
  saveLabel: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  discardButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
  },
  discardLabel: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '600',
  },
});
