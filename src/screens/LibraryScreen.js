import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, radius, typography } from '../theme/theme';
import { scanDeviceForMusic } from '../services/LibraryScanner';
import { setQueue } from '../services/PlayerService';

export default function LibraryScreen({ navigation }) {
  const [scanning, setScanning] = useState(true);
  const [foundCount, setFoundCount] = useState(0);
  const [tracks, setTracks] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const results = await scanDeviceForMusic(count => mounted && setFoundCount(count));
        if (mounted) setTracks(results);
      } catch (e) {
        // permission denied or scan error — leave list empty, UI shows empty state
      } finally {
        if (mounted) setScanning(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return tracks;
    const q = query.toLowerCase();
    return tracks.filter(t => t.title.toLowerCase().includes(q));
  }, [tracks, query]);

  const playFrom = async index => {
    await setQueue(filtered, index);
    navigation.navigate('Player');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={typography.h1 && styles.header}>Your Library</Text>
      <Text style={styles.subheader}>
        {scanning ? `Scanning device… ${foundCount} found` : `${tracks.length} songs · phone & SD card`}
      </Text>

      <View style={styles.searchBar}>
        <Icon name="search" size={16} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search your local music"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      {scanning && tracks.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.subheader}>Indexing every folder on your device…</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Icon name="music" size={40} color={colors.textMuted} />
          <Text style={styles.subheader}>No local songs found yet</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.row} onPress={() => playFrom(index)}>
              <View style={styles.thumb}>
                <Icon name="music" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.path} numberOfLines={1}>{item.path}</Text>
              </View>
              <Icon name="play" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  header: { color: colors.textPrimary, fontSize: 26, fontWeight: '800', marginTop: spacing.sm },
  subheader: { color: colors.textMuted, marginBottom: spacing.md, marginTop: spacing.xs },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, marginLeft: spacing.sm, color: colors.textPrimary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  title: { color: colors.textPrimary, fontWeight: '600' },
  path: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
});
