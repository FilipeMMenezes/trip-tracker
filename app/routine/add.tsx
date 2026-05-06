import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Crypto from 'expo-crypto';
import { saveRoutine } from '../../src/db/routineRepository';
import { Routine } from '../../src/types/routine';
import { Coordinate } from '../../src/types/trip';

const RADIUS_OPTIONS = [
  { label: '250 m', value: 250 },
  { label: '500 m', value: 500 },
  { label: '1 km', value: 1000 },
];

const DEFAULT_REGION: Region = {
  latitude: 37.0902,
  longitude: -95.7129,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function AddRoutineScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [name, setName] = useState('');
  const [destinationLabel, setDestinationLabel] = useState('');
  const [arrivalHour, setArrivalHour] = useState('09');
  const [arrivalMinute, setArrivalMinute] = useState('00');
  const [matchRadius, setMatchRadius] = useState(500);
  const [pinLocation, setPinLocation] = useState<Coordinate>({
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  });
  const [isSaving, setIsSaving] = useState(false);

  const minuteInputRef = useRef<TextInput>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coord: Coordinate = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setPinLocation(coord);
        mapRef.current?.animateToRegion(
          { ...coord, latitudeDelta: 0.01, longitudeDelta: 0.01 },
          500
        );
      }
    })();
  }, []);

  const handleSetCurrentLocation = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Location permission is required.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const coord: Coordinate = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
    setPinLocation(coord);
    mapRef.current?.animateToRegion(
      { ...coord, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      400
    );
  };

  const validateTime = (): string | null => {
    const h = parseInt(arrivalHour, 10);
    const m = parseInt(arrivalMinute, 10);
    if (isNaN(h) || h < 0 || h > 23) return 'Hour must be 0–23.';
    if (isNaN(m) || m < 0 || m > 59) return 'Minute must be 0–59.';
    return null;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a name for this routine.');
      return;
    }
    const timeError = validateTime();
    if (timeError) {
      Alert.alert('Invalid time', timeError);
      return;
    }

    setIsSaving(true);
    const h = parseInt(arrivalHour, 10).toString().padStart(2, '0');
    const m = parseInt(arrivalMinute, 10).toString().padStart(2, '0');

    const routine: Routine = {
      id: Crypto.randomUUID(),
      name: name.trim(),
      destinationLat: pinLocation.latitude,
      destinationLng: pinLocation.longitude,
      destinationLabel: destinationLabel.trim() || undefined,
      arrivalTime: `${h}:${m}`,
      matchRadiusMeters: matchRadius,
      isActive: true,
      createdAt: Date.now(),
    };

    await saveRoutine(routine);
    setIsSaving(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <Label>Routine Name</Label>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Morning Commute to Work"
          placeholderTextColor="#636366"
          value={name}
          onChangeText={setName}
          returnKeyType="next"
          autoFocus
        />

        <Label>Destination</Label>
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_DEFAULT}
            initialRegion={DEFAULT_REGION}
            userInterfaceStyle="dark"
          >
            <Marker
              coordinate={pinLocation}
              draggable
              pinColor="#007AFF"
              onDragEnd={(e) => setPinLocation(e.nativeEvent.coordinate)}
            />
          </MapView>
        </View>
        <TouchableOpacity style={styles.locationButton} onPress={handleSetCurrentLocation}>
          <Text style={styles.locationButtonText}>Set to current location</Text>
        </TouchableOpacity>

        <Label>Destination Label (optional)</Label>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Office"
          placeholderTextColor="#636366"
          value={destinationLabel}
          onChangeText={setDestinationLabel}
          returnKeyType="next"
        />

        <Label>Target Arrival Time</Label>
        <View style={styles.timeRow}>
          <TextInput
            style={[styles.textInput, styles.timeInput]}
            value={arrivalHour}
            onChangeText={(t) => {
              const clean = t.replace(/\D/g, '').slice(0, 2);
              setArrivalHour(clean);
              if (clean.length === 2) minuteInputRef.current?.focus();
            }}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="HH"
            placeholderTextColor="#636366"
            returnKeyType="next"
          />
          <Text style={styles.timeSeparator}>:</Text>
          <TextInput
            ref={minuteInputRef}
            style={[styles.textInput, styles.timeInput]}
            value={arrivalMinute}
            onChangeText={(t) => {
              const clean = t.replace(/\D/g, '').slice(0, 2);
              setArrivalMinute(clean);
            }}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="MM"
            placeholderTextColor="#636366"
            returnKeyType="done"
          />
          <Text style={styles.timeHint}>(24 h)</Text>
        </View>

        <Label>Match Radius</Label>
        <View style={styles.radiusRow}>
          {RADIUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.radiusChip,
                matchRadius === opt.value && styles.radiusChipActive,
              ]}
              onPress={() => setMatchRadius(opt.value)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.radiusChipLabel,
                  matchRadius === opt.value && styles.radiusChipLabelActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <Text style={styles.saveLabel}>{isSaving ? 'Saving…' : 'Save Routine'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  scroll: {
    padding: 20,
    paddingBottom: 48,
  },
  label: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFF',
    fontSize: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  mapContainer: {
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  locationButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  locationButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    width: 72,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  timeSeparator: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '300',
  },
  timeHint: {
    color: '#636366',
    fontSize: 13,
    marginLeft: 4,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: 10,
  },
  radiusChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  radiusChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  radiusChipLabel: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  radiusChipLabelActive: {
    color: '#FFF',
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveLabel: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
