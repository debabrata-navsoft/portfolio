/**
 * Capacitor expects `index.html` at the root of `webDir`, but the Angular SSR
 * builder names the client entry `index.csr.html` (the server build owns
 * `index.html`). Vercel works around this with a rewrite in vercel.json;
 * a packaged app has no rewrite layer, so copy it here instead.
 *
 * Runs as part of `npm run build:mobile`.
 */
import { copyFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const browserDir = join(process.cwd(), 'dist', 'frontend', 'browser');
const csr = join(browserDir, 'index.csr.html');
const target = join(browserDir, 'index.html');

try {
  await access(csr);
} catch {
  console.error(
    `\n[prepare-mobile] ${csr} not found.\nRun "ng build" first — build:mobile does this for you.\n`,
  );
  process.exit(1);
}

await copyFile(csr, target);
console.log('[prepare-mobile] index.csr.html -> index.html');
