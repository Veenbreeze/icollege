import { useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { colors, radii, spacing } from '@/theme';
import { searchSongs } from '@/lib/api/music';

const STOREFRONTS = [
  { code: 'tz', label: 'Tanzania' },
  { code: 'ke', label: 'Kenya' },
  { code: 'ng', label: 'Nigeria' },
  { code: 'za', label: 'South Africa' },
  { code: 'gb', label: 'UK' },
  { code: 'us', label: 'US' },
  { code: 'in', label: 'India' },
];

export default function MusicScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('tz');
  const [searched, setSearched] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTrack, setActiveTrack] = useState(null);
  const player = useAudioPlayer(null, { updateInterval: 500, downloadFirst: false });
  const status = useAudioPlayerStatus(player);
  const activeTrackId = activeTrack?.id;

  const search = async () => {
    const term = query.trim();
    if (term.length < 2) {
      setError('Enter at least 2 characters to search.');
      return;
    }
    if (!/^[a-z]{2}$/.test(country)) {
      setError('Choose a storefront or enter a valid 2-letter country code.');
      return;
    }
    setSearched(true);
    setLoading(true);
    setError('');
    setTracks([]);
    player.pause();
    setActiveTrack(null);
    try {
      const result = await searchSongs(term, country);
      setTracks(result.tracks ?? []);
    } catch (err) {
      setError(err.message || 'Music search is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const togglePreview = async (track) => {
    if (activeTrackId === track.id && status.playing) {
      player.pause();
      return;
    }
    if (activeTrackId !== track.id) {
      player.replace(track.previewUrl);
      setActiveTrack(track);
    } else if (status.didJustFinish) {
      await player.seekTo(0);
    }
    player.play();
  };

  const openStore = async (url) => {
    try {
      await Linking.openURL(url);
    } catch {
      setError('Could not open the Apple Music listing on this device.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.topTitle}>Music Chamber</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIcon}><Ionicons name="musical-notes" size={25} color="#fff" /></View>
          <Text style={styles.title}>Find your next favorite</Text>
          <Text style={styles.subtitle}>Search tracks from music storefronts around the world and play official previews.</Text>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={19} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
            placeholder="Song, artist, or album"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            style={styles.searchInput}
            accessibilityLabel="Search songs"
          />
          <Pressable onPress={search} style={styles.searchButton} accessibilityLabel="Search">
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        </View>

        <Text style={styles.regionLabel}>Explore a country storefront</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionList}>
          {STOREFRONTS.map((item) => (
            <Pressable
              key={item.code}
              onPress={() => { setCountry(item.code); setTracks([]); setSearched(false); setError(''); }}
              style={[styles.regionPill, country === item.code && styles.regionPillActive]}
            >
              <Text style={[styles.regionText, country === item.code && styles.regionTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.otherRegionRow}>
          <Text style={styles.otherRegionLabel}>More countries</Text>
          <TextInput
            value={STOREFRONTS.some((item) => item.code === country) ? '' : country.toUpperCase()}
            onChangeText={(value) => { setCountry(value.trim().toLowerCase()); setTracks([]); setSearched(false); setError(''); }}
            placeholder="Country code"
            placeholderTextColor={colors.textMuted}
            maxLength={2}
            autoCapitalize="characters"
            style={styles.otherRegionInput}
            accessibilityLabel="Other country storefront code"
          />
          <Text style={styles.otherRegionHint}>2-letter code</Text>
        </View>

        <View style={styles.catalogNote}>
          <Ionicons name="information-circle-outline" size={17} color="#A75B13" />
          <Text style={styles.catalogNoteText}>Catalog availability and previews vary by country. Previews stream from Apple and are provided courtesy of iTunes. Open a track listing to listen to the full song where available.</Text>
        </View>

        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 28 }} />}
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        {!loading && searched && !error && tracks.length === 0 && <Text style={styles.empty}>No playable previews found in this storefront. Try another country or search term.</Text>}
        {!searched && <Text style={styles.empty}>Search a song or artist to explore available tracks.</Text>}

        {tracks.map((track) => {
          const isActive = activeTrackId === track.id;
          return (
            <View key={`${country}-${track.id}`} style={styles.trackCard}>
              {track.artworkUrl
                ? <Image source={{ uri: track.artworkUrl }} style={styles.artwork} />
                : <View style={[styles.artwork, styles.artworkFallback]}><Ionicons name="musical-note" size={22} color={colors.textMuted} /></View>}
              <View style={styles.trackDetails}>
                <Text numberOfLines={1} style={styles.trackTitle}>{track.title}</Text>
                <Text numberOfLines={1} style={styles.trackArtist}>{track.artist}</Text>
                <Text numberOfLines={1} style={styles.trackAlbum}>{track.album}</Text>
                {isActive && status.playing && (
                  <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, (status.currentTime / (status.duration || 30)) * 100)}%` }]} /></View>
                )}
                <Pressable onPress={() => openStore(track.storeUrl)} hitSlop={6}>
                  <Text style={styles.storeLink}>Open in Apple Music</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => togglePreview(track)} style={styles.playButton} accessibilityLabel={`${isActive && status.playing ? 'Pause' : 'Play'} preview of ${track.title}`}>
                <Ionicons name={isActive && status.playing ? 'pause' : 'play'} size={19} color={colors.white} />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 48 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  topTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  hero: { alignItems: 'center', paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  heroIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2994A', marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 23, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 6 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.lg, paddingLeft: spacing.md, paddingRight: 6, minHeight: 54 },
  searchInput: { flex: 1, color: colors.text, paddingHorizontal: spacing.sm, fontSize: 15, minHeight: 50 },
  searchButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  regionLabel: { color: colors.text, fontSize: 13, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
  regionList: { gap: 8 },
  regionPill: { backgroundColor: colors.surface, borderRadius: radii.pill, paddingHorizontal: 13, paddingVertical: 9 },
  regionPillActive: { backgroundColor: '#FDEEDF', borderColor: '#F2994A', borderWidth: 1 },
  regionText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  regionTextActive: { color: '#A75B13' },
  otherRegionRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: spacing.md },
  otherRegionLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  otherRegionInput: { width: 94, height: 36, borderRadius: radii.md, paddingHorizontal: 10, color: colors.text, backgroundColor: colors.surface, textAlign: 'center', fontWeight: '700' },
  otherRegionHint: { color: colors.textMuted, fontSize: 11 },
  catalogNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, marginTop: spacing.md, borderRadius: radii.md, backgroundColor: '#FFF7ED' },
  catalogNoteText: { flex: 1, fontSize: 12, lineHeight: 18, color: '#7C4A1B' },
  error: { color: colors.red, fontSize: 14, marginTop: spacing.lg, textAlign: 'center' },
  empty: { color: colors.textMuted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.lg },
  trackCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 11, marginTop: 10, backgroundColor: colors.surface, borderRadius: radii.lg },
  artwork: { width: 58, height: 58, borderRadius: 12, backgroundColor: colors.surfaceMuted },
  artworkFallback: { alignItems: 'center', justifyContent: 'center' },
  trackDetails: { flex: 1, minWidth: 0 },
  trackTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  trackArtist: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  trackAlbum: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  storeLink: { color: colors.primary, fontSize: 11, fontWeight: '700', marginTop: 5 },
  playButton: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2994A' },
  progressTrack: { height: 3, backgroundColor: colors.border, borderRadius: 2, marginTop: 7, overflow: 'hidden' },
  progressFill: { height: 3, backgroundColor: '#F2994A' },
};
