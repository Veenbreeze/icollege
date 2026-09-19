import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { useApi } from '@/hooks/useApi';
import { fetchLibrary } from '@/lib/api/library';
import { resolveMediaUrl } from '@/lib/api/client';

const ICON_FOR = {
  pdf: { icon: 'document-text', color: colors.red },
  image: { icon: 'image', color: colors.blue },
  doc: { icon: 'document', color: colors.primary },
};

function iconFor(type) {
  return ICON_FOR[type] ?? ICON_FOR.doc;
}

export default function LibraryScreen() {
  const { data, isLoading, error } = useApi(fetchLibrary);
  const [query, setQuery] = useState('');

  const materials = Array.isArray(data) ? data : [];

  // Group materials by course code so the list reads like a shelf.
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? materials.filter((m) => (m.name ?? '').toLowerCase().includes(q) || (m.courseCode ?? '').toLowerCase().includes(q))
      : materials;
    const byCourse = {};
    for (const m of filtered) {
      const key = m.courseCode ?? m.courseTitle ?? 'General';
      (byCourse[key] ??= []).push(m);
    }
    return byCourse;
  }, [materials, query]);

  const courses = Object.keys(grouped);
  const isEmpty = !isLoading && (error || materials.length === 0);

  function open(m) {
    const url = resolveMediaUrl(m.url ?? m.storagePath);
    if (url) Linking.openURL(url).catch(() => {});
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="iLibrary" subtitle="Course materials & resources" />

      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes, past papers, courses…"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : isEmpty ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="library-outline" size={30} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No materials yet</Text>
            <Text style={styles.emptyBody}>
              Lecture notes, slides and past papers your lecturers upload will appear here, organised by course.
            </Text>
          </View>
        ) : (
          courses.map((course) => (
            <View key={course} style={styles.courseGroup}>
              <Text style={styles.courseHeading}>{course}</Text>
              <Card style={styles.courseCard}>
                {grouped[course].map((m, i) => {
                  const meta = iconFor(m.type ?? m.docType);
                  return (
                    <Pressable
                      key={m.id ?? i}
                      style={[styles.row, i < grouped[course].length - 1 && styles.rowDivider]}
                      onPress={() => open(m)}
                    >
                      <View style={[styles.fileIcon, { backgroundColor: colors.surfaceMuted }]}>
                        <Ionicons name={meta.icon} size={20} color={meta.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.fileName} numberOfLines={1}>{m.name}</Text>
                        <Text style={styles.fileMeta} numberOfLines={1}>
                          {[m.type ?? m.docType, m.uploadedBy, m.size].filter(Boolean).join(' · ')}
                        </Text>
                      </View>
                      <Ionicons name="download-outline" size={19} color={colors.textMuted} />
                    </Pressable>
                  );
                })}
              </Card>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginHorizontal: spacing.lg, marginTop: spacing.md,
    backgroundColor: colors.surface, borderRadius: radii.lg, paddingHorizontal: spacing.lg, height: 48,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },
  content: { padding: spacing.lg, paddingBottom: 120 },

  courseGroup: { marginBottom: spacing.lg },
  courseHeading: { fontSize: 13, fontWeight: '800', color: colors.textSecondary, marginBottom: spacing.sm, letterSpacing: 0.3 },
  courseCard: { padding: 0, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  fileIcon: { width: 42, height: 42, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  fileName: { fontSize: 14, fontWeight: '600', color: colors.text },
  fileMeta: { fontSize: 12, color: colors.textMuted, marginTop: 1 },

  emptyWrap: { alignItems: 'center', marginTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyIcon: { width: 64, height: 64, borderRadius: radii.xl, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  emptyBody: { fontSize: 13.5, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
}));
