import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor packages the **browser** bundle only — the SSR `dist/frontend/server`
 * output is not used inside the app. Run `npm run build:mobile` (not `ng build`)
 * before syncing: the Angular SSR builder emits `index.csr.html`, and Capacitor
 * needs a real `index.html` in `webDir`.
 */
const config: CapacitorConfig = {
  appId: 'com.debabratadas.portfolio',
  appName: 'Debabrata Das',
  webDir: 'dist/frontend/browser',

  server: {
    // Android serves the app from https://localhost, iOS from capacitor://localhost.
    // Both origins must be in the backend CORS allowlist (backend/server.js).
    androidScheme: 'https',
  },

  android: {
    // Release builds talk to the Render API over HTTPS, so cleartext stays off.
    // Flip to true only while pointing the app at a local http:// LAN address.
    allowMixedContent: false,
  },
};

export default config;
