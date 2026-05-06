import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Crypto from 'expo-crypto';
import TripMap from '../../src/components/TripMap';
import TripControls from '../../src/components/TripControls';
import TripHUD from '../../src/components/TripHUD';
import TripSummaryModal from '../../src/components/TripSummaryModal';
import { useLocationTracking } from '../../src/hooks/useLocationTracking';
import { useTripTimer } from '../../src/hooks/useTripTimer';
import { useTripStore } from '../../src/store/tripStore';
import { totalDistanceMiles } from '../../src/utils/tripUtils';
import { Trip, Coordinate } from '../../src/types/trip';

export default function TrackScreen() {
  const isTracking = useTripStore((s) => s.isTracking);
  const currentSpeedMph = useTripStore((s) => s.currentSpeedMph);
  const elapsedSeconds = useTripStore((s) => s.elapsedSeconds);
  const activeTrip = useTripStore((s) => s.activeTrip);
  const startTrip = useTripStore((s) => s.startTrip);
  const stopTrip = useTripStore((s) => s.stopTrip);
  const addLocation = useTripStore((s) => s.addLocation);

  const [pendingTrip, setPendingTrip] = useState<Trip | null>(null);

  const handleLocationUpdate = useCallback(
    (coord: Coordinate, speedMph: number) => {
      addLocation(coord, speedMph);
    },
    [addLocation]
  );

  const { currentLocation, hasPermission } = useLocationTracking({
    isTracking,
    onUpdate: handleLocationUpdate,
  });

  useTripTimer();

  const handleStop = () => {
    const data = stopTrip();
    if (!data || data.coordinates.length < 2) return;

    const distanceMiles = totalDistanceMiles(data.coordinates);
    const avgSpeedMph =
      data.speedSamples.length > 0
        ? data.speedSamples.reduce((a, b) => a + b, 0) / data.speedSamples.length
        : 0;

    const trip: Trip = {
      id: Crypto.randomUUID(),
      startedAt: data.startedAt,
      endedAt: Date.now(),
      durationSeconds: elapsedSeconds,
      distanceMiles,
      maxSpeedMph: data.maxSpeedMph,
      avgSpeedMph,
      coordinates: data.coordinates,
    };
    setPendingTrip(trip);
  };

  // The modal owns the actual save (routine matching + DB write)
  const handleSave = () => setPendingTrip(null);

  const handleDiscard = () => setPendingTrip(null);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <TripMap
        currentLocation={currentLocation}
        coordinates={activeTrip?.coordinates ?? []}
        isTracking={isTracking}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View pointerEvents="box-none">
          {isTracking && (
            <TripHUD speed={currentSpeedMph} elapsedSeconds={elapsedSeconds} />
          )}
        </View>
        <TripControls
          isTracking={isTracking}
          hasPermission={hasPermission}
          onStart={startTrip}
          onStop={handleStop}
        />
      </SafeAreaView>

      <TripSummaryModal
        trip={pendingTrip}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
});
