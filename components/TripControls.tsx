import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';

interface Props {
  isTracking: boolean;
  hasPermission: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function TripControls({
  isTracking,
  hasPermission,
  onStart,
  onStop,
}: Props) {
  const disabled = !hasPermission;

  const label = disabled
    ? 'Location Permission Required'
    : isTracking
    ? 'Stop Trip'
    : 'Start Trip';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          isTracking ? styles.stopButton : styles.startButton,
          disabled && styles.disabledButton,
        ]}
        onPress={isTracking ? onStop : onStart}
        disabled={disabled}
        activeOpacity={0.82}
      >
        {/* Icon — play triangle or stop square */}
        <View style={styles.iconSlot}>
          {isTracking ? (
            <View style={styles.stopIcon} />
          ) : (
            <View style={styles.playIcon} />
          )}
        </View>

        <Text style={[styles.label, disabled && styles.disabledLabel]}>
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    gap: 10,
    // Elevated shadow for floating-over-map feel.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
  startButton: {
    backgroundColor: '#007AFF',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#2C2C2E',
  },
  iconSlot: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Right-pointing triangle via zero-size borders.
  playIcon: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 14,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#fff',
    marginLeft: 2, // optical centering — triangles read left-heavy
  },
  stopIcon: {
    width: 14,
    height: 14,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  label: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  disabledLabel: {
    color: '#636366',
  },
});
