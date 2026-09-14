/**
 * Opens the Capacitor Android project in Android Studio.
 *
 * `npx cap open android` only probes one hard-coded path
 * (/usr/local/android-studio/bin/studio.sh) and fails on a snap install, or on
 * Studio 2024.2+ where `studio.sh` was renamed to `studio`. This finds the real
 * launcher and hands it to Capacitor via CAPACITOR_ANDROID_STUDIO_PATH.
 *
 * Runs as part of `npm run mobile:android`.
 */
import { accessSync, constants } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

const home = homedir();

const CANDIDATES = [
  // snap (what `sudo snap install android-studio --classic` gives you)
  '/snap/bin/android-studio',
  '/snap/android-studio/current/bin/studio',
  '/snap/android-studio/current/bin/studio.sh',
  // manual tarball installs
  '/opt/android-studio/bin/studio',
  '/opt/android-studio/bin/studio.sh',
  '/usr/local/android-studio/bin/studio',
  '/usr/local/android-studio/bin/studio.sh',
  join(home, 'android-studio/bin/studio'),
  join(home, 'android-studio/bin/studio.sh'),
  // JetBrains Toolbox
  join(home, '.local/share/JetBrains/Toolbox/apps/android-studio/bin/studio'),
];

const isExecutable = (path) => {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

// An explicit env var always wins.
const studio = process.env.CAPACITOR_ANDROID_STUDIO_PATH || CANDIDATES.find(isExecutable);

if (!studio) {
  console.error(`
[open-android] Android Studio not found.

  Install it:      sudo snap install android-studio --classic
  Then launch it once and let it download the Android SDK
  (this project needs platform 36 — see android/variables.gradle).

  Already installed somewhere else? Point at its launcher:
    export CAPACITOR_ANDROID_STUDIO_PATH=/path/to/android-studio/bin/studio

  You do not need Android Studio to build from the CLI — with a JDK 21 and the
  Android SDK on PATH:  cd android && ./gradlew assembleDebug
`);
  process.exit(1);
}

console.log(`[open-android] using ${studio}`);

const result = spawnSync('npx', ['cap', 'open', 'android'], {
  stdio: 'inherit',
  env: { ...process.env, CAPACITOR_ANDROID_STUDIO_PATH: studio },
});

process.exit(result.status ?? 1);
