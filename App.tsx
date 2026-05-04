import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import TripMap from './components/TripMap';
import TripControls from './components/TripControls';
import TripHUD from './components/TripHUD';
import { useLocationTracking } from './hooks/useLocationTracking';
import { useTripTimer } from './hooks/useTripTimer';

export default function App() {
  const [isTracking, setIsTracking] = useState(false);

  const { coordinates, currentLocation, currentSpeed, hasPermission } =
    useLocationTracking(isTracking);

  const elapsedSeconds = useTripTimer(isTracking);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Full-screen map sits behind everything else. */}
      <TripMap
        currentLocation={currentLocation}
        coordinates={coordinates}
        isTracking={isTracking}
      />

      {/*
        Overlay layout: the SafeAreaView spans the full screen with
        space-between so the HUD lands at the top and the button at the
        bottom, both inside the safe area. pointerEvents="box-none" lets
        touches pass through to the map where there's no UI.
      */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        {/* Top slot: HUD is only rendered during an active trip. */}
        <View pointerEvents="box-none">
          {isTracking && (
            <TripHUD speed={currentSpeed} elapsedSeconds={elapsedSeconds} />
          )}
        </View>

        {/* Bottom slot: Start / Stop button. */}
        <TripControls
          isTracking={isTracking}
          hasPermission={hasPermission}
          onStart={() => setIsTracking(true)}
          onStop={() => setIsTracking(false)}
        />
      </SafeAreaView>
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
