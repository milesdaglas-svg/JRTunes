import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform } from 'react-native';

const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.flac', '.wav', '.ogg', '.aac', '.opus', '.wma'];

// Common roots to scan on Android: internal storage + any mounted SD cards.
// RNFS.getAllExternalFilesDirs / ExternalStorageDirectoryPath covers most devices;
// we also probe /storage/* for removable SD cards since Android doesn't expose
// a single unified "search everywhere" API.
async function getScanRoots() {
  const roots = new Set();
  roots.add(RNFS.ExternalStorageDirectoryPath); // internal "phone" storage

  try {
    const storageRoot = '/storage';
    const entries = await RNFS.readDir(storageRoot);
    entries.forEach(e => {
      // Skip "self" and "emulated" (already covered above), keep real SD card mounts
      if (e.isDirectory() && e.name !== 'self' && e.name !== 'emulated') {
        roots.add(e.path);
      }
    });
  } catch (e) {
    // /storage may not be readable on some OEM skins without extra permission; ignore
  }

  return Array.from(roots);
}

async function requestPermissions() {
  if (Platform.OS !== 'android') return true;

  if (Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

async function walk(dirPath, results, onProgress) {
  let items;
  try {
    items = await RNFS.readDir(dirPath);
  } catch (e) {
    return; // permission-denied / unreadable folder — skip quietly
  }

  for (const item of items) {
    if (item.isDirectory()) {
      // Skip obvious junk / system dirs to keep the scan fast
      if (['.thumbnails', 'Android/data', 'Android/obb', '.cache'].some(skip => item.path.includes(skip))) {
        continue;
      }
      await walk(item.path, results, onProgress);
    } else {
      const lower = item.name.toLowerCase();
      if (AUDIO_EXTENSIONS.some(ext => lower.endsWith(ext))) {
        results.push({
          id: item.path,
          title: item.name.replace(/\.[^/.]+$/, ''),
          path: item.path,
          size: item.size,
          source: 'local',
        });
        if (onProgress) onProgress(results.length);
      }
    }
  }
}

/**
 * Scans the whole device — internal storage and any SD card — for audio
 * files and returns one merged list. Call this from a background task /
 * splash screen since a full-device walk can take a while on large SD cards.
 */
export async function scanDeviceForMusic(onProgress) {
  const ok = await requestPermissions();
  if (!ok) throw new Error('Storage permission denied');

  const roots = await getScanRoots();
  const results = [];
  for (const root of roots) {
    await walk(root, results, onProgress);
  }
  return results;
}
