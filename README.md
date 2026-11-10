# DayStack

A private, offline-first daily checklist app for iOS & Web, built with React Native, Expo SDK 58, TypeScript, SQLite (Native), and IndexedDB (PWA).

## Features

- **Multiple Categories**: Group daily tasks by domain (Fitness, Deep Work, Personal, etc.).
- **Category Management**: Add, edit (rename, update color), delete, and reorder categories.
- **Task Management**: Add, edit, delete, and reorder tasks within categories using direct tactile controls.
- **Tactile Checkbox**: Instant toggle with subtle feedback and completion styling.
- **Daily Progress Percentage**: Real-time completion progress with remaining task counter.
- **Preserved Completion History**: Daily completions are permanently logged (`task_completions`), with a 7-day consistency tracker on the dashboard.
- **Automatic Midnight Reset**: Tasks automatically reset at local calendar midnight without data loss. Re-evaluates on app foregrounding, window focus, and active midnight timeout.
- **Progressive Web App (PWA)**:
  - Installable on iOS Safari via **"Add to Home Screen"**.
  - Runs in fullscreen **standalone display mode**.
  - **IndexedDB** persistent browser storage.
  - **Service Worker** caching for 100% offline operation.
- **Native iOS Support**: Local SQLite persistence with WAL mode and foreign keys enabled.
- **Zero Backend**: No accounts, no cloud database, 100% offline and private.
- **Premium Minimalist UI**: Dark theme (`#080A09`), signature lime accent (`#C2F970`), refined typography, and native iOS styling.

## Running the Application

### 1. As a Progressive Web App (PWA) in the Browser

To build and serve the production PWA locally:

```bash
npm run build:web
npm run serve
```

Then open `http://localhost:3000` (or `http://<your-lan-ip>:3000` on your iPhone).

To run in development mode with live reloading:

```bash
npm run web
```

### 2. Installing on iPhone (Safari PWA)

1. Open `http://<your-lan-ip>:3000` in **Safari** on your iPhone.
2. Tap the **Share** button (box with an upward arrow).
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add**. The DayStack icon will appear on your Home Screen.
5. Tap the icon to launch DayStack in fullscreen standalone mode (no browser address bar).
6. DayStack works completely offline via its Service Worker and IndexedDB storage.

### 3. As a Native App via Expo Go

1. Install **Expo Go** on your iPhone.
2. Run:

   ```bash
   npm start
   ```

3. Ensure your iPhone and PC are on the same Wi-Fi network, then scan the QR code shown in the terminal.

## Architecture

- `src/types/`: Strict TypeScript domain models (`Category`, `Task`, `TaskCompletion`, `DayHistoryItem`).
- `src/storage/`: Unified storage abstraction:
  - `indexedDb.ts`: Browser storage using native IndexedDB for PWA.
  - `sqliteStorage.ts`: Native storage using `expo-sqlite`.
  - `context.web.tsx` & `context.native.tsx`: Platform-resolved providers.
- `src/hooks/`: Reactive state management (`useDayStack`), midnight timer scheduling, and AppState/visibility monitoring.
- `src/components/`: Modular UI components with iOS design principles (`Header`, `ProgressCard`, `CategoryFilterBar`, `CategorySection`, `TaskRow`, modals).
- `src/utils/`: Local date utilities, cross-platform alert dialogs, and haptic feedback wrappers.
- `public/`: PWA web manifest (`manifest.json`), service worker (`sw.js`), HTML template (`index.html`), and app icons.
