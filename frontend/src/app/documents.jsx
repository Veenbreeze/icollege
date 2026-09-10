import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { colors, radii, spacing, shadow, themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApi } from '@/hooks/useApi';
import { fetchDocuments, uploadDocument, deleteDocument } from '@/lib/api/documents';
import { ApiError } from '@/lib/api/client';
import { docCategories } from '@/data/mock';
export default function DocumentsScreen() {
  const [cat, setCat] = useState('all');
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const { data: documents, isLoading, refetch } = useApi(fetchDocuments);
  const filtered = useMemo(() => {
    const byCategory = cat === 'all' ? (documents ?? []) : (documents ?? []).filter((d) => d.category === cat);
    if (!query.trim()) return byCategory;
    const q = query.trim().toLowerCase();
    return byCategory.filter((d) => d.name.toLowerCase().includes(q));
  }, [cat, documents, query]);
  const categoriesWithCounts = docCategories.map((c) => ({
    ...c,
    count: c.key === 'all' ? (documents ?? []).length : (documents ?? []).filter((d) => d.category === c.key).length,
  }));
  const onUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setUploading(true);
    setUploadError(null);
    try {
      await uploadDocument(
        {
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType,
        },
        cat === 'all' ? 'all' : cat,
      );
      refetch();
    } catch (e) {
      setUploadError(e instanceof ApiError ? e.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  const onDelete = async (id) => {
    await deleteDocument(id);
    refetch();
  };
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        <ScreenHeader title="iVault" subtitle="Your secure documents" />

        {/* Search */}
        <View style={styles.search}>
          <Ionicons name="search" size={19} color={colors.textMuted} />
          <TextInput
            placeholder="Search documents"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categoriesWithCounts.map((c) => {
            const active = c.key === cat;
            return (
              <Pressable key={c.key} style={[styles.chip, active && styles.chipOn]} onPress={() => setCat(c.key)}>
                <Ionicons name={c.icon} size={15} color={active ? colors.white : c.color} />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: active ? colors.white : colors.textSecondary,
                    },
                  ]}
                >
                  {c.label}
                </Text>
                <View
                  style={[
                    styles.countBadge,
                    active && {
                      backgroundColor: 'rgba(255,255,255,0.25)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      active && {
                        color: colors.white,
                      },
                    ]}
                  >
                    {c.count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>Files</Text>

        {isLoading && (
          <ActivityIndicator
            color={colors.primary}
            style={{
              marginTop: spacing.lg,
            }}
          />
        )}
        {!isLoading && filtered.length === 0 && (
          <Text style={styles.emptyText}>No documents here yet. Tap Upload to add one.</Text>
        )}
        {filtered.map((d) => (
          <DocRow key={d.id} doc={d} onDelete={() => onDelete(d.id)} />
        ))}
      </ScrollView>

      {uploadError && (
        <View style={styles.uploadErrorBanner}>
          <Ionicons name="alert-circle" size={16} color={colors.red} />
          <Text style={styles.uploadErrorText}>{uploadError}</Text>
        </View>
      )}

      {/* Upload FAB */}
      <Pressable style={styles.fab} onPress={onUpload} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Ionicons name="cloud-upload-outline" size={22} color={colors.white} />
        )}
        <Text style={styles.fabText}>{uploading ? 'Uploading…' : 'Upload'}</Text>
      </Pressable>
    </SafeAreaView>
  );
}
const DOC_ICON_META = {
  pdf: {
    icon: 'document-text',
    color: colors.red,
    soft: colors.redSoft,
  },
  image: {
    icon: 'image',
    color: colors.blue,
    soft: colors.blueSoft,
  },
  doc: {
    icon: 'document',
    color: colors.primary,
    soft: colors.primarySoft,
  },
};
function DocRow({ doc, onDelete }) {
  const meta = DOC_ICON_META[doc.type];
  return (
    <Card style={styles.row}>
      <View
        style={[
          styles.docIcon,
          {
            backgroundColor: meta.soft,
          },
        ]}
      >
        <Ionicons name={meta.icon} size={22} color={meta.color} />
      </View>
      <View
        style={{
          flex: 1,
        }}
      >
        <Text style={styles.docName} numberOfLines={1}>
          {doc.name}
        </Text>
        <Text style={styles.docMeta}>
          {doc.size} · {new Date(doc.date).toLocaleDateString()}
        </Text>
      </View>
      <Pressable hitSlop={8} onPress={onDelete}>
        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
      </Pressable>
    </Card>
  );
}
const styles = themedStyles((colors) => ({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    height: 50,
    borderRadius: radii.lg,
    ...shadow.soft,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  chips: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  chipOn: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: colors.surfaceMuted,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  docIcon: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
  },
  docMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  uploadErrorBanner: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl + 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.redSoft,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  uploadErrorText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.red,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    height: 52,
    borderRadius: radii.pill,
    ...shadow.card,
    shadowColor: colors.primary,
  },
  fabText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
}));
