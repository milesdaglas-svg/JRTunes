import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import Slider from '@react-native-community/slider';
import TrackPlayer, { useProgress, usePlaybackState, State } from 'react-native-track-player';
import { colors, spacing, radius } from '../theme/theme';
import { getLyrics } from '../services/LyricsService';

export default function PlayerScreen({ navigation }) {
  const { position, duration } = useProgress(500);
  const playbackState = usePlaybackState();
  const [track, setTrack] = useState(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState(null); // { synced, plain, source } | null | 'loading'
  const lyricsScrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      const t = await TrackPlayer.getActiveTrack();
      setTrack(t);
      setLyrics(null);
      setShowLyrics(false);
    })();
  }, [playbackState]);

  const openLyrics = async () => {
    setShowLyrics(true);
    if (lyrics || !track) return;
    setLyrics('loading');
    const result = await getLyrics({ title: track.title, artist: track.artist, duration });
    setLyrics(result); // null if nothing found on lrclib.net
  };

  // Auto-scroll to the currently active synced line
  const activeLineIndex = React.useMemo(() => {
    if (!lyrics || lyrics === 'loading' || !lyrics.synced) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.synced.length; i++) {
      if (lyrics.synced[i].time <= position) idx = i;
      else break;
    }
    return idx;
  }, [lyrics, position]);

  useEffect(() => {
    if (activeLineIndex >= 0 && lyricsScrollRef.current) {
      lyricsScrollRef.current.scrollTo({ y: Math.max(0, activeLineIndex * 32 - 100), animated: true });
    }
  }, [activeLineIndex]);

  const isPlaying = playbackState.state === State.Playing;
  const togglePlay = () => (isPlaying ? TrackPlayer.pause() : TrackPlayer.play());

  const fmt = s => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <LinearGradient colors={[colors.accentAlt + '55', colors.background]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-down" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topLabel}>NOW PLAYING</Text>
          <TouchableOpacity onPress={openLyrics}>
            <Icon name="align-left" size={22} color={showLyrics ? colors.accent : colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {showLyrics ? (
          <View style={styles.lyricsPanel}>
            <ScrollView ref={lyricsScrollRef} contentContainerStyle={{ paddingVertical: spacing.lg }}>
              {lyrics === 'loading' && (
                <Text style={styles.lyricsMuted}>Looking up lyrics…</Text>
              )}
              {lyrics === null && (
                <Text style={styles.lyricsMuted}>No lyrics found for this track.</Text>
              )}
              {lyrics && lyrics !== 'loading' && lyrics.synced && lyrics.synced.length > 0 && (
                lyrics.synced.map((line, i) => (
                  <Text
                    key={i}
                    style={[styles.lyricLine, i === activeLineIndex && styles.lyricLineActive]}>
                    {line.text || '♪'}
                  </Text>
                ))
              )}
              {lyrics && lyrics !== 'loading' && (!lyrics.synced || lyrics.synced.length === 0) && lyrics.plain && (
                <Text style={styles.lyricLine}>{lyrics.plain}</Text>
              )}
              {lyrics && lyrics !== 'loading' && (
                <Text style={styles.lyricsAttribution}>Lyrics via lrclib.net</Text>
              )}
            </ScrollView>
            <TouchableOpacity style={styles.closeLyrics} onPress={() => setShowLyrics(false)}>
              <Icon name="chevron-up" size={18} color={colors.textSecondary} />
              <Text style={styles.lyricsMuted}>Back to player</Text>
            </TouchableOpacity>
          </View>
        ) : (
        <>
        <View style={styles.artworkWrap}>
          {track?.artwork ? (
            <Image source={{ uri: track.artwork }} style={styles.artwork} />
          ) : (
            <View style={[styles.artwork, styles.artworkPlaceholder]}>
              <Icon name="music" size={64} color={colors.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.meta}>
          <Text style={styles.trackTitle} numberOfLines={1}>{track?.title || 'Nothing playing'}</Text>
          <Text style={styles.trackArtist} numberOfLines={1}>{track?.artist || ''}</Text>
        </View>

        <Slider
          style={{ width: '100%', height: 32 }}
          minimumValue={0}
          maximumValue={duration || 1}
          value={position}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accent}
          onSlidingComplete={val => TrackPlayer.seekTo(val)}
        />
        <View style={styles.timeRow}>
          <Text style={styles.time}>{fmt(position)}</Text>
          <Text style={styles.time}>{fmt(duration)}</Text>
        </View>
        </>
        )}

        <View style={styles.controls}>
          <TouchableOpacity onPress={() => TrackPlayer.skipToPrevious()}>
            <Icon name="skip-back" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
            <Icon name={isPlaying ? 'pause' : 'play'} size={30} color={colors.background} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => TrackPlayer.skipToNext()}>
            <Icon name="skip-forward" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, marginTop: spacing.sm,
  },
  topLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  artworkWrap: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.lg },
  artwork: { width: 280, height: 280, borderRadius: radius.lg },
  artworkPlaceholder: { backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  meta: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  trackTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
  trackArtist: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  time: { color: colors.textMuted, fontSize: 12 },
  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xl, marginTop: spacing.lg,
  },
  playBtn: {
    width: 64, height: 64, borderRadius: radius.pill, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  lyricsPanel: { flex: 1, paddingHorizontal: spacing.lg },
  lyricLine: {
    color: colors.textSecondary, fontSize: 17, fontWeight: '600',
    lineHeight: 32, textAlign: 'center', marginBottom: 4,
  },
  lyricLineActive: { color: colors.accent, fontSize: 19 },
  lyricsMuted: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
  lyricsAttribution: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: spacing.lg },
  closeLyrics: { alignItems: 'center', paddingVertical: spacing.md },
});
