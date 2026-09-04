import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, shadow , themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import {
  searchExamples,
  smartSearchInterpretation,
  searchResults,
} from '@/data/mock';

export default function AiSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const run = (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.searchBox}>
          <Ionicons name="sparkles" size={17} color={colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ask in plain language..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => run(query)}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); setSubmitted(false); }} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {!submitted ? (
          <>
            <View style={styles.hero}>
              <View style={styles.heroIcon}>
                <Ionicons name="sparkles" size={26} color={colors.primary} />
              </View>
              <Text style={styles.heroTitle}>Smart Search</Text>
              <Text style={styles.heroSub}>
                Search across courses, people, documents, chambers, events, jobs and projects — just describe what you need.
              </Text>
            </View>

            <Text style={styles.label}>Try searching</Text>
            {searchExamples.map((e) => (
              <Pressable key={e} style={styles.exampleRow} onPress={() => run(e)}>
                <Ionicons name="search-outline" size={16} color={colors.textMuted} />
                <Text style={styles.exampleText}>{e}</Text>
                <Ionicons name="arrow-forward" size={15} color={colors.textMuted} />
              </Pressable>
            ))}
          </>
        ) : (
          <>
            {/* Interpretation */}
            <View style={styles.interpret}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
              <Text style={styles.interpretText}>
                <Text style={{ fontWeight: '700' }}>iAI understood: </Text>
                {smartSearchInterpretation}
              </Text>
            </View>

            <Text style={styles.resultsCount}>{searchResults.length} results</Text>
            {searchResults.map((r) => (
              <Pressable key={r.id} onPress={() => r.route && router.push(r.route as any)}>
                <Card style={styles.resultCard}>
                  <View style={[styles.resultIcon, { backgroundColor: r.soft }]}>
                    <Ionicons name={r.icon as any} size={20} color={r.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.resultTop}>
                      <Text style={styles.resultTitle} numberOfLines={1}>{r.title}</Text>
                      <View style={[styles.catPill, { backgroundColor: r.soft }]}>
                        <Text style={[styles.catText, { color: r.color }]}>{r.category}</Text>
                      </View>
                    </View>
                    <Text style={styles.resultSub} numberOfLines={1}>{r.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </Card>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg, height: 48, borderRadius: radii.pill, ...shadow.soft,
  },
  searchInput: { flex: 1, fontSize: 14.5, color: colors.text },

  hero: { alignItems: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  heroIcon: { width: 62, height: 62, borderRadius: radii.xl, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  heroTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  heroSub: { fontSize: 13.5, color: colors.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 20 },

  label: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, paddingHorizontal: spacing.lg, marginTop: spacing.xxl, marginBottom: spacing.sm },
  exampleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.sm, ...shadow.soft },
  exampleText: { flex: 1, fontSize: 13.5, color: colors.text },

  interpret: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primarySoft, marginHorizontal: spacing.lg, marginTop: spacing.lg, padding: spacing.md, borderRadius: radii.md },
  interpretText: { flex: 1, fontSize: 12.5, color: colors.text },

  resultsCount: { fontSize: 12.5, color: colors.textMuted, paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm },
  resultCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.md },
  resultIcon: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  resultTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  resultTitle: { flex: 1, fontSize: 14.5, fontWeight: '700', color: colors.text },
  catPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.pill },
  catText: { fontSize: 10, fontWeight: '700' },
  resultSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
}));
