import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllRoutines, deleteRoutine } from '../../src/db/routineRepository';
import { getTripsForRoutine } from '../../src/db/tripRepository';
import { analyzeRoutine } from '../../src/utils/trafficAnalysis';
import { cancelRoutineNotification } from '../../src/utils/notifications';
import CommuteSuggestionCard from '../../src/components/CommuteSuggestionCard';
import { Routine, DepartureRecommendation } from '../../src/types/routine';

interface RoutineWithStats extends Routine {
  tripCount: number;
  recommendation: DepartureRecommendation;
}

export default function RoutinesScreen() {
  const [routines, setRoutines] = useState<RoutineWithStats[]>([]);
  const router = useRouter();

  const load = useCallback(async () => {
    const all = await getAllRoutines();
    const enriched = await Promise.all(
      all.map(async (routine) => {
        const trips = await getTripsForRoutine(routine.id);
        const recommendation = analyzeRoutine(routine, trips);
        return { ...routine, tripCount: trips.length, recommendation };
      })
    );
    setRoutines(enriched);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDelete = (routine: RoutineWithStats) => {
    Alert.alert(
      'Delete Routine',
      `Delete "${routine.name}"? This won't delete matched trips.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await cancelRoutineNotification(routine.id);
            await deleteRoutine(routine.id);
            setRoutines((prev) => prev.filter((r) => r.id !== routine.id));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.header}>Routines</Text>

      {routines.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="map-outline" size={52} color="#3A3A3C" />
          <Text style={styles.emptyTitle}>No routines yet</Text>
          <Text style={styles.emptyHint}>
            Add a routine to start tracking your commute patterns and get smart departure
            recommendations.
          </Text>
        </View>
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RoutineCard
              routine={item}
              onPress={() => router.push(`/routine/${item.id}`)}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/routine/add')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function RoutineCard({
  routine,
  onPress,
  onDelete,
}: {
  routine: RoutineWithStats;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Text style={styles.routineName}>{routine.name}</Text>
          <Text style={styles.arrivalTime}>
            Arrive by {routine.arrivalTime}
            {routine.destinationLabel ? ` · ${routine.destinationLabel}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <CommuteSuggestionCard
        recommendation={routine.recommendation}
        tripCount={routine.tripCount}
      />
    </TouchableOpacity>
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
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLeft: {
    flex: 1,
    marginRight: 12,
  },
  routineName: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 3,
  },
  arrivalTime: {
    color: '#8E8E93',
    fontSize: 13,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyHint: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
