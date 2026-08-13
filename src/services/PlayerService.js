import TrackPlayer, { Capability, Event, RepeatMode } from 'react-native-track-player';

export async function setupPlayer() {
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
      Capability.Stop,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
  });
  await TrackPlayer.setRepeatMode(RepeatMode.Queue);
}

export async function playTrack(track) {
  await TrackPlayer.reset();
  await TrackPlayer.add({
    id: track.id,
    url: track.path ? `file://${track.path}` : track.streamUrl,
    title: track.title,
    artist: track.artist || 'Unknown Artist',
    artwork: track.artwork,
  });
  await TrackPlayer.play();
}

export async function setQueue(tracks, startIndex = 0) {
  await TrackPlayer.reset();
  await TrackPlayer.add(
    tracks.map(t => ({
      id: t.id,
      url: t.path ? `file://${t.path}` : t.streamUrl,
      title: t.title,
      artist: t.artist || 'Unknown Artist',
      artwork: t.artwork,
    })),
  );
  await TrackPlayer.skip(startIndex);
  await TrackPlayer.play();
}

// Registered in index.js — keeps playback + lock-screen controls alive
// while the app is backgrounded.
export async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.destroy());
}
