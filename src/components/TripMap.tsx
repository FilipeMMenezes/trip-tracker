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

const INITIAL_REGION: Region = {
  latitude: 37.0902,
  longitude: -95.7129,
  latitudeDelta: 40,
  longitudeDelta: 40,
};

export default function TripMap({ currentLocation, coordinates, isTracking }: Props) {
  const mapRef = useRef<MapView>(null);

  // Track the user live during an active trip.
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

  // Zoom to current position on first GPS fix (idle state).
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

  // Fit to all coordinates when viewing a saved trip (no current location).
  useEffect(() => {
    if (!isTracking && !currentLocation && coordinates.length > 1 && mapRef.current) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
        animated: true,
      });
    }
  }, []);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFillObject}
      provider={PROVIDER_DEFAULT}
      initialRegion={INITIAL_REGION}
      showsUserLocation={false}
      showsCompass={true}
      showsScale={true}
      userInterfaceStyle="dark"
    >
      {coordinates.length > 1 && (
        <Polyline
          coordinates={coordinates}
          strokeColor="#007AFF"
          strokeWidth={4}
          lineCap="round"
          lineJoin="round"
        />
      )}

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
