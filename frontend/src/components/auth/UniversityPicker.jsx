import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { listUniversities } from '@/lib/api/auth';

export function UniversityPicker({ value, onChange }) {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    let current = true;
    listUniversities().then((rows) => {
      if (!current) return;
      setUniversities(rows);
      if (!value && rows.length === 1) onChange(rows[0].slug);
    }).catch(() => { if (current) setLoadError(true); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [onChange, value]);
  const selected = universities.find((u) => u.slug === value);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>University</Text>
      {loading ? <ActivityIndicator color={colors.primary} /> : loadError ? (
        <Text style={styles.message}>Universities could not be loaded. Check your connection and try again.</Text>
      ) : universities.length === 0 ? (
        <Text style={styles.message}>No universities are accepting accounts yet.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {universities.map((u) => (
            <Pressable key={u.id} accessibilityRole="radio" accessibilityState={{ checked: value === u.slug }} onPress={() => onChange(u.slug)} style={[styles.chip, value === u.slug && styles.selected]}>
              <Ionicons name="business-outline" size={15} color={value === u.slug ? colors.white : colors.textSecondary} />
              <Text numberOfLines={1} style={[styles.name, value === u.slug && styles.selectedName]}>{u.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      {selected ? <Text accessibilityLiveRegion="polite" style={styles.current}>Selected: {selected.name}</Text> : null}
    </View>
  );
}

const styles = themedStyles((c) => ({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: c.textSecondary, marginBottom: spacing.sm },
  chip: { maxWidth: 250, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceMuted, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill, marginRight: spacing.sm },
  selected: { backgroundColor: c.primary, borderColor: c.primary },
  name: { color: c.textSecondary, fontSize: 12, fontWeight: '600', flexShrink: 1 },
  selectedName: { color: c.white },
  current: { fontSize: 11, color: c.textMuted, marginTop: spacing.xs },
  message: { fontSize: 12, color: c.textSecondary, paddingVertical: spacing.sm },
}));
