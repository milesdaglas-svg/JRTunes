import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, radius } from '../theme/theme';
import { searchPodcasts, getEpisodes, downloadEpisode } from '../services/PodcastService';
import { playTrack } from '../services/PlayerService';

export default function PodcastScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [podcasts, setPodcasts] = useState([]);
  const [episodes, setEpisodes] = useState(null);
  const [activePodcast, setActivePodcast] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSearch = async text => {
    setQuery(text);
    setEpisodes(null);
    if (!text.trim()) { setPodcasts([]); return; }
    setLoading(true);
    try {
      setPodcasts(await searchPodcasts(text));
    } finally {
      setLoading(false);
    }
  };

  const openPodcast = async podcast => {
    setActivePodcast(podcast);
    setLoading(true);
    try {
      setEpisodes(await getEpisodes(podcast.feedUrl));
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async ep => {
    await playTrack({ ...ep, artist: activePodcast?.title });
    navigation.navigate('Player');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Podcasts</Text>
      <View style={styles.searchBar}>
        <Icon name="search" size={16} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={runSearch}
          placeholder="Search podcasts"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      {loading && <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.lg }} />}

      {!episodes ? (
        <FlatList
          data={podcasts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => openPodcast(item)}>
              <View style={styles.thumb}><Icon name="mic" size={18} color={colors.accentAlt} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
              </View>
              <Icon name="chevron-right" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          ListHeaderComponent={
            <TouchableOpacity onPress={() => setEpisodes(null)} style={{ marginBottom: spacing.sm }}>
              <Text style={{ color: colors.accent }}>‹ Back to results</Text>
            </TouchableOpacity>
          }
          data={episodes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => handlePlay(item)}>
                <View style={styles.thumb}><Icon name="headphones" size={18} color={colors.accent} /></View>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => downloadEpisode(item)}>
                <Icon name="download" size={18} color={colors.accent} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  header: { color: colors.textPrimary, fontSize: 26, fontWeight: '800', marginTop: spacing.sm, marginBottom: spacing.md },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.pill, paddingHorizontal: spacing.md, height: 44, marginBottom: spacing.md,
  },
  searchInput: { flex: 1, marginLeft: spacing.sm, color: colors.textPrimary },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm,
    borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  thumb: {
    width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  title: { color: colors.textPrimary, fontWeight: '600', flex: 1 },
  artist: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
