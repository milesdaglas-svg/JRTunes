import axios from 'axios';

const BASE_URL = 'https://lrclib.net/api';

// Parses standard LRC timestamp format "[mm:ss.xx]" into a list of
// { time (seconds), text } lines for sync-scrolling display.
function parseSyncedLyrics(lrc) {
  if (!lrc) return null;
  const lines = lrc.split('\n');
  const parsed = [];
  const timeTag = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    const matches = [...line.matchAll(timeTag)];
    if (matches.length === 0) continue;
    const text = line.replace(timeTag, '').trim();
    for (const m of matches) {
      const minutes = parseInt(m[1], 10);
      const seconds = parseInt(m[2], 10);
      const ms = m[3] ? parseInt(m[3].padEnd(3, '0'), 10) : 0;
      parsed.push({ time: minutes * 60 + seconds + ms / 1000, text });
    }
  }
  return parsed.sort((a, b) => a.time - b.time);
}

/**
 * Looks up lyrics for a track by title/artist/duration.
 * Returns { synced: [{time, text}] | null, plain: string | null, source: 'lrclib.net' }
 * or null if nothing was found.
 */
export async function getLyrics({ title, artist, duration }) {
  try {
    const { data } = await axios.get(`${BASE_URL}/get`, {
      params: {
        track_name: title,
        artist_name: artist || '',
        duration: duration ? Math.round(duration) : undefined,
      },
    });

    return {
      synced: parseSyncedLyrics(data.syncedLyrics),
      plain: data.plainLyrics || null,
      source: 'lrclib.net',
    };
  } catch (e) {
    // Not found (404) or offline — treat as "no lyrics available"
    return null;
  }
}
