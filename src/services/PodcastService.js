import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import RNFS from 'react-native-fs';

// iTunes Search API is free, public, and requires no key — used only for
// discovery. The actual audio is fetched straight from each podcast's own
// public RSS feed, which is how podcasts are legally and openly distributed.
export async function searchPodcasts(query, limit = 20) {
  const { data } = await axios.get('https://itunes.apple.com/search', {
    params: { term: query, media: 'podcast', limit },
  });

  return data.results.map(p => ({
    id: `podcast:${p.collectionId}`,
    title: p.collectionName,
    artist: p.artistName,
    artwork: p.artworkUrl600,
    feedUrl: p.feedUrl,
  }));
}

export async function getEpisodes(feedUrl, limit = 30) {
  const { data: xml } = await axios.get(feedUrl);
  const parsed = await parseStringPromise(xml, { explicitArray: false });
  const items = [].concat(parsed?.rss?.channel?.item || []).slice(0, limit);

  return items.map((item, i) => ({
    id: `episode:${feedUrl}:${i}`,
    title: item.title,
    streamUrl: item.enclosure?.$?.url,
    duration: item['itunes:duration'],
    artwork: item['itunes:image']?.$?.href,
    source: 'podcast',
  }));
}

export async function downloadEpisode(episode, onProgress) {
  const dest = `${RNFS.DocumentDirectoryPath}/downloads/${encodeURIComponent(episode.id)}.mp3`;
  await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/downloads`);

  const result = RNFS.downloadFile({
    fromUrl: episode.streamUrl,
    toFile: dest,
    progress: res => {
      if (onProgress) onProgress(res.bytesWritten / res.contentLength);
    },
    progressDivider: 5,
  });

  await result.promise;
  return { ...episode, path: dest, source: 'local', downloaded: true };
}
