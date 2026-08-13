import axios from 'axios';
import RNFS from 'react-native-fs';

// Jamendo hosts independent artists' tracks under Creative Commons licenses
// that explicitly permit free download/streaming — this is what makes the
// "download for offline" feature legal. Get a free client_id at
// https://developer.jamendo.com and drop it in below.
const CLIENT_ID = 'YOUR_JAMENDO_CLIENT_ID';
const BASE_URL = 'https://api.jamendo.com/v3.0';

export async function searchTracks(query, limit = 25) {
  const { data } = await axios.get(`${BASE_URL}/tracks/`, {
    params: {
      client_id: CLIENT_ID,
      format: 'json',
      limit,
      namesearch: query,
      include: 'musicinfo',
      audioformat: 'mp32',
    },
  });

  return data.results.map(t => ({
    id: `jamendo:${t.id}`,
    title: t.name,
    artist: t.artist_name,
    artwork: t.image,
    streamUrl: t.audio,
    duration: t.duration,
    license: t.license_ccurl,
    source: 'jamendo',
  }));
}

export async function downloadTrack(track, onProgress) {
  const dest = `${RNFS.DocumentDirectoryPath}/downloads/${track.id.replace(':', '_')}.mp3`;
  await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/downloads`);

  const result = RNFS.downloadFile({
    fromUrl: track.streamUrl,
    toFile: dest,
    progress: res => {
      if (onProgress) onProgress(res.bytesWritten / res.contentLength);
    },
    progressDivider: 5,
  });

  await result.promise;
  return { ...track, path: dest, source: 'local', downloaded: true };
}
