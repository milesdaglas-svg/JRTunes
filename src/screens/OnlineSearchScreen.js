import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, radius } from '../theme/theme';
import { searchTracks, downloadTrack } from '../services/JamendoService';
import { playTrack } from '../services/PlayerService';

export default function OnlineSearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const runSearch = async text => {
    setQuery(text);
    if (!text.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const tracks = await searchTracks(text);
      setResults(tracks);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async track => {
    await playTrack(track);
    navigation.navigate('Player');
  };

  const handleDownload = async track => {
    setDownloadingId(track.id);
    try {
      await downloadTrack(track);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Discover</Text>
      <Text style={styles.subheader}>Free, Creative-Commons licensed tracks — safe to download</Text>

      <View style={styles.searchBar}>
        <Icon name="search" size={16} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={runSearch}
          placeholder="Search artists, tracks, genres"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      {loading && <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.lg }} />}

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => handlePlay(item)}>
              <View style={styles.thumb}><Icon name="radio" size={18} color={colors.accentAlt} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDownload(item)} disabled={downloadingId === item.id}>
              <Icon
                name={downloadingId === item.id ? 'loader' : 'download'}
                size={18}
                color={colors.accent}
              />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  header: { color: colors.textPrimary, fontSize: 26, fontWeight: '800', marginTop: spacing.sm },
  subheader: { color: colors.textMuted, marginBottom: spacing.md, marginTop: spacing.xs },
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
  title: { color: colors.textPrimary, fontWeight: '600' },
  artist: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
