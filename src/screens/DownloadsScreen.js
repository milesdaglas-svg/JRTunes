import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, radius } from '../theme/theme';
import { setQueue } from '../services/PlayerService';

export default function DownloadsScreen({ navigation }) {
  const [files, setFiles] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        const dir = `${RNFS.DocumentDirectoryPath}/downloads`;
        try {
          const exists = await RNFS.exists(dir);
          if (!exists) { if (mounted) setFiles([]); return; }
          const items = await RNFS.readDir(dir);
          if (mounted) {
            setFiles(items.map(f => ({
              id: f.path, title: f.name.replace(/\.[^/.]+$/, ''), path: f.path, source: 'local',
            })));
          }
        } catch (e) {
          if (mounted) setFiles([]);
        }
      })();
      return () => { mounted = false; };
    }, []),
  );

  const playFrom = async index => {
    await setQueue(files, index);
    navigation.navigate('Player');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Downloads</Text>
      <Text style={styles.subheader}>Available offline — no connection needed</Text>
      {files.length === 0 ? (
        <View style={styles.centered}>
          <Icon name="download" size={40} color={colors.textMuted} />
          <Text style={styles.subheader}>Nothing downloaded yet</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.row} onPress={() => playFrom(index)}>
              <View style={styles.thumb}><Icon name="check-circle" size={18} color={colors.accent} /></View>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm,
    borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  thumb: {
    width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  title: { color: colors.textPrimary, fontWeight: '600', flex: 1 },
});
