import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, shadow , themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { docCategories, documents, type Document } from '@/data/mock';

export default function DocumentsScreen() {
  const router = useRouter();
  const [cat, setCat] = useState('all');

  const filtered = useMemo(
    () => (cat === 'all' ? documents : documents.filter((d) => d.category === cat)),
    [cat],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.title}>iVault</Text>
            <Text style={styles.subtitle}>Your secure documents</Text>
          </View>
          <Pressable style={styles.lockBadge}>
            <Ionicons name="shield-checkmark" size={16} color={colors.green} />
            <Text style={styles.lockText}>Encrypted</Text>
          </Pressable>
        </View>

        {/* Storage meter */}
        <Card style={styles.storageCard}>
          <View style={styles.storageTop}>
            <Text style={styles.storageLabel}>Storage used</Text>
            <Text style={styles.storageValue}>1.9 GB of 5 GB</Text>
          </View>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: '38%' }]} />
          </View>
        </Card>

        {/* Search */}
        <View style={styles.search}>
          <Ionicons name="search" size={19} color={colors.textMuted} />
          <TextInput placeholder="Search documents" placeholderTextColor={colors.textMuted} style={styles.searchInput} />
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {docCategories.map((c) => {
            const active = c.key === cat;
            return (
              <Pressable key={c.key} style={[styles.chip, active && styles.chipOn]} onPress={() => setCat(c.key)}>
                <Ionicons name={c.icon as any} size={15} color={active ? colors.white : c.color} />
                <Text style={[styles.chipText, { color: active ? colors.white : colors.textSecondary }]}>{c.label}</Text>
                <View style={[styles.countBadge, active && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  <Text style={[styles.countText, active && { color: colors.white }]}>{c.count}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>Files</Text>
        {filtered.map((d) => (
          <DocRow key={d.id} doc={d} />
        ))}
      </ScrollView>

      {/* Upload FAB */}
      <Pressable style={styles.fab}>
        <Ionicons name="cloud-upload-outline" size={22} color={colors.white} />
        <Text style={styles.fabText}>Upload</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function DocRow({ doc }: { doc: Document }) {
  return (
    <Card style={styles.row}>
      <View style={[styles.docIcon, { backgroundColor: doc.soft }]}>
        <Ionicons
          name={(doc.type === 'pdf' ? 'document-text' : doc.type === 'image' ? 'image' : 'document') as any}
          size={22}
          color={doc.color}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
        <Text style={styles.docMeta}>{doc.size} · {doc.date}</Text>
      </View>
      <Pressable hitSlop={8}>
        <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
      </Pressable>
    </Card>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  lockBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.greenSoft, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radii.pill },
  lockText: { fontSize: 11, fontWeight: '700', color: colors.green },

  storageCard: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  storageTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  storageLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  storageValue: { fontSize: 13, color: colors.text, fontWeight: '700' },
  bar: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, backgroundColor: colors.primary },

  search: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface,
    marginHorizontal: spacing.lg, marginTop: spacing.lg, paddingHorizontal: spacing.lg, height: 50, borderRadius: radii.lg, ...shadow.soft,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },

  chips: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill, backgroundColor: colors.surface, ...shadow.soft },
  chipOn: { backgroundColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600' },
  countBadge: { backgroundColor: colors.surfaceMuted, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' },
  countText: { fontSize: 10, fontWeight: '700', color: colors.textSecondary },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },

  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.md },
  docIcon: { width: 46, height: 46, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  docName: { fontSize: 14.5, fontWeight: '700', color: colors.text },
  docMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  fab: {
    position: 'absolute', right: spacing.lg, bottom: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primary, paddingHorizontal: spacing.xl, height: 52, borderRadius: radii.pill,
    ...shadow.card, shadowColor: colors.primary,
  },
  fabText: { color: colors.white, fontSize: 15, fontWeight: '700' },
}));
