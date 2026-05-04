import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
  Region,
} from 'react-native-maps';
import * as Location from 'expo-location';
import { Coordinate } from '../types/trip';

interface Props {
  currentLocation: Location.LocationObject | null;
  coordinates: Coordinate[];
  isTracking: boolean;
}

// Default region shown before the first GPS fix — centered on the US.
const INITIAL_REGION: Region = {
  latitude: 37.0902,
  longitude: -95.7129,
  latitudeDelta: 40,
  longitudeDelta: 40,
};

export default function TripMap({ currentLocation, coordinates, isTracking }: Props) {
  const mapRef = useRef<MapView>(null);

  // Keep the map centered on the user's position while a trip is active.
  useEffect(() => {
    if (isTracking && currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        600
      );
    }
  }, [currentLocation, isTracking]);

  // Zoom to the user's location on the first GPS fix (before a trip starts).
  useEffect(() => {
    if (!isTracking && currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        800
      );
    }
  }, [currentLocation?.coords.latitude, currentLocation?.coords.longitude]);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFillObject}
      // PROVIDER_DEFAULT uses MapKit on iOS — no API key required.
      provider={PROVIDER_DEFAULT}
      initialRegion={INITIAL_REGION}
      showsUserLocation={false} // We draw a custom marker to reflect trip state.
      showsCompass={true}
      showsScale={true}
      userInterfaceStyle="dark"
    >
      {/* Blue polyline tracing the recorded route. */}
      {coordinates.length > 1 && (
        <Polyline
          coordinates={coordinates}
          strokeColor="#007AFF"
          strokeWidth={4}
          lineCap="round"
          lineJoin="round"
        />
      )}

      {/* Custom location dot — turns red while a trip is recording. */}
      {currentLocation && (
        <Marker
          coordinate={{
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <LocationDot isTracking={isTracking} />
        </Marker>
      )}
    </MapView>
  );
}

function LocationDot({ isTracking }: { isTracking: boolean }) {
  // Blue at rest, red while recording.
  const accent = isTracking ? '#FF3B30' : '#007AFF';
  return (
    <View
      style={[
        styles.dotOuter,
        { backgroundColor: accent + '40', borderColor: accent + '80' },
      ]}
    >
      <View style={[styles.dotInner, { backgroundColor: accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  dotOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
  },
});
