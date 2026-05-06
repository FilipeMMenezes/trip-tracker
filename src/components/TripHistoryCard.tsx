import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Trip } from '../types/trip';
import { formatDuration, formatDate, formatTime } from '../utils/tripUtils';

interface Props {
  trip: Trip;
  onPress: () => void;
  onDelete: () => void;
}

export default function TripHistoryCard({ trip, onPress, onDelete }: Props) {
  const handleDelete = () => {
    Alert.alert('Delete Trip', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.main}>
        <Text style={styles.date}>{formatDate(trip.startedAt)}</Text>
        <Text style={styles.time}>{formatTime(trip.startedAt)}</Text>
        <View style={styles.metrics}>
          <Metric value={trip.distanceMiles.toFixed(2)} unit="mi" />
          <Metric value={formatDuration(trip.durationSeconds)} unit="time" />
          <Metric value={Math.round(trip.maxSpeedMph).toString()} unit="mph max" />
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={handleDelete}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function Metric({ value, unit }: { value: string; unit: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricUnit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  main: { flex: 1 },
  date: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 12,
  },
  metrics: {
    flexDirection: 'row',
    gap: 20,
  },
  metric: {},
  metricValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  metricUnit: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
  },
  deleteIcon: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '700',
  },
});
