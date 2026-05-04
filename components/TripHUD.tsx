import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface Props {
  speed: number; // mph
  elapsedSeconds: number;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  return `${m}:${pad(s)}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export default function TripHUD({ speed, elapsedSeconds }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Metric value={Math.round(speed).toString()} unit="mph" />
        <View style={styles.separator} />
        <Metric value={formatElapsed(elapsedSeconds)} unit="elapsed" />
      </View>
    </View>
  );
}

function Metric({ value, unit }: { value: string; unit: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.unit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    backgroundColor: 'rgba(28, 28, 30, 0.88)',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  metric: {
    alignItems: 'center',
    minWidth: 64,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    // Tabular nums prevent the display from shifting width as digits change.
    fontVariant: ['tabular-nums'],
  },
  unit: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  separator: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 4,
  },
});
