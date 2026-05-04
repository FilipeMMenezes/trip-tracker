# Trip Tracker

A GPS-powered trip tracking app built with React Native, Expo, and MapKit. Records your route as a polyline, shows live speed in mph, and times each trip. Built as an MVP foundation for a full trip analytics app (commute times, traffic delays, toll costs, and more).

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ (bundled with Node) |
| Expo Go (iPhone) | Latest from App Store |

## Setup

**1. Install Node.js** (if not already installed)

Download the LTS release from [nodejs.org](https://nodejs.org) and run the installer. Open a new terminal after installation so the PATH update takes effect.

**2. Install dependencies**

```bash
cd C:\Users\filip\Projects\trip-tracker
npm install
```

**3. Add placeholder app icons**

Expo needs these files in `assets/` before it will bundle the app. You can use any PNG files as placeholders, or generate proper ones later:

| File | Size | Purpose |
|------|------|---------|
| `assets/icon.png` | 1024×1024 | App icon |
| `assets/splash.png` | 1284×2778 | Launch screen |
| `assets/adaptive-icon.png` | 1024×1024 | Android adaptive icon |
| `assets/favicon.png` | 48×48 | Web favicon |

Quick way to generate defaults — run this once after `npm install`:

```bash
npx expo install expo-asset
```

Or simply copy any PNG you have and rename it to match each filename above.

**4. Start the dev server**

```bash
npm start
```

## Previewing on iPhone with Expo Go

1. Download **Expo Go** from the App Store on your iPhone.
2. Connect your iPhone and your computer to the **same Wi-Fi network**.
3. Run `npm start` — a QR code appears in the terminal.
4. Open the Camera app on your iPhone and scan the QR code. Tap the Expo Go banner that appears.
5. The app loads on your phone. Tap **Allow** when prompted for location access.

> **Tip:** GPS works best outdoors. Indoors, speed will read 0 and the location may jump around slightly — this is normal.

## Project Structure

```
trip-tracker/
├── App.tsx                       # Root — owns isTracking state, composes UI
├── app.json                      # Expo config: bundle ID, permissions, splash
├── package.json
├── tsconfig.json
├── babel.config.js
│
├── components/
│   ├── TripMap.tsx               # Full-screen MapKit map, polyline, location dot
│   ├── TripControls.tsx          # Floating Start / Stop button
│   └── TripHUD.tsx               # Live speed (mph) + elapsed time overlay
│
├── hooks/
│   ├── useLocationTracking.ts    # GPS subscription, coordinate array, speed
│   └── useTripTimer.ts           # Seconds-counter tied to isTracking flag
│
└── types/
    └── trip.ts                   # Shared TypeScript types (Coordinate)
```

## How It Works

1. On launch, `useLocationTracking` requests foreground location permission.
2. Tapping **Start Trip** sets `isTracking = true`, which:
   - Clears any previous route coordinates
   - Starts a `Location.watchPositionAsync` subscription (1 s / 3 m intervals)
   - Starts the trip timer
3. Each location update appends a coordinate to the polyline and updates the speed readout.
4. The map auto-pans to keep the user's position centered during an active trip.
5. Tapping **Stop Trip** removes the subscription and freezes the HUD.

## iOS Configuration

Configured in `app.json`:

| Setting | Value |
|---------|-------|
| Bundle identifier | `com.triptracker.app` |
| Location permission (foreground) | "Trip Tracker uses your location to record your route while driving." |
| Location permission (always) | Included for future background tracking support |
| Background mode | `location` (declared for App Store review; not active in MVP) |

## Planned Features

- **Trip history** — persist routes locally with AsyncStorage or SQLite
- **Commute analytics** — average travel time by time of day / day of week
- **Traffic time estimation** — compare trip duration to baseline
- **Toll detection** — geofence known toll plazas and estimate costs
- **Export** — share GPX or CSV summaries
- **iCloud sync** — across devices

## Changing the Map Style

The map uses **MapKit** (`PROVIDER_DEFAULT`) and respects iOS dark mode automatically. To switch to Google Maps on iOS, install a Google Maps API key and change `provider` in `TripMap.tsx`:

```tsx
import { PROVIDER_GOOGLE } from 'react-native-maps';
// ...
<MapView provider={PROVIDER_GOOGLE} ... />
```

Google Maps requires a paid API key and additional `app.json` configuration.
