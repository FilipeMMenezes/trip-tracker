import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DepartureRecommendation } from '../types/routine';
import { formatHHMM } from '../utils/tripUtils';

interface Props {
  recommendation: DepartureRecommendation;
  tripCount: number;
}

const CONFIDENCE_COLORS = {
  low: '#FF9500',
  medium: '#34C759',
  high: '#007AFF',
} as const;

const CONFIDENCE_LABELS = {
  low: 'Low confidence',
  medium: 'Good confidence',
  high: 'High confidence',
} as const;

export default function CommuteSuggestionCard({ recommendation, tripCount }: Props) {
  if (!recommendation.unlocked) {
    return <LockedCard tripCount={tripCount} tripsUntilUnlock={recommendation.tripsUntilUnlock} />;
  }
  return <UnlockedCard recommendation={recommendation} />;
}

function LockedCard({
  tripCount,
  tripsUntilUnlock,
}: {
  tripCount: number;
  tripsUntilUnlock: number;
}) {
  const progress = tripCount / 10;
  return (
    <View style={styles.card}>
      <View style={styles.lockedRow}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.lockedText}>
          {tripsUntilUnlock} more {tripsUntilUnlock === 1 ? 'trip' : 'trips'} to unlock smart departure times
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{tripCount} / 10 trips recorded</Text>
    </View>
  );
}

function UnlockedCard({ recommendation }: { recommendation: DepartureRecommendation }) {
  const confidenceColor = CONFIDENCE_COLORS[recommendation.confidence];
  const confidenceLabel = CONFIDENCE_LABELS[recommendation.confidence];

  return (
    <View style={styles.card}>
      <View style={styles.unlockedRow}>
        <View>
          <Text style={styles.leaveByLabel}>Leave by</Text>
          <Text style={styles.departureTime}>
            {formatHHMM(recommendation.suggestedDepartureTime)}
          </Text>
        </View>
        <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor + '20', borderColor: confidenceColor + '60' }]}>
          <Text style={[styles.confidenceText, { color: confidenceColor }]}>
            {confidenceLabel}
          </Text>
        </View>
      </View>
      <Text style={styles.subtitle}>
        Based on {recommendation.basedOnTrips} trips · Usually takes{' '}
        {Math.round(recommendation.avgDurationMinutes)} min
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    marginTop: 10,
  },
  // Locked
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  lockIcon: {
    fontSize: 16,
  },
  lockedText: {
    color: '#8E8E93',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressLabel: {
    color: '#636366',
    fontSize: 11,
    textAlign: 'right',
  },
  // Unlocked
  unlockedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leaveByLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  departureTime: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 13,
  },
});
