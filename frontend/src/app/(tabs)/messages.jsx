import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, shadow, themedStyles } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { useApi } from '@/hooks/useApi';
import { usePolling } from '@/hooks/usePolling';
import { fetchThreads } from '@/lib/api/chat';
import { resolveAccent } from '@/lib/colorKey';
import { timeAgo } from '@/lib/timeAgo';
export default function MessagesScreen() {
  const router = useRouter();
  const { data: threads, isLoading, refetch } = useApi(fetchThreads);
  usePolling(refetch, 8000);
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={19} color={colors.textMuted} />
        <TextInput placeholder="Search messages" placeholderTextColor={colors.textMuted} style={styles.searchInput} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 110,
        }}
      >
        {isLoading && (
          <ActivityIndicator
            color={colors.primary}
            style={{
              marginTop: spacing.lg,
            }}
          />
        )}
        {(threads ?? []).map((m) => {
          const { color } = resolveAccent(m.colorKey);
          return (
            <Pressable key={m.id} style={styles.row} onPress={() => router.push(`/chat/${m.id}`)}>
              <Avatar initials={m.initials} size={52} color={color} />
              <View
                style={{
                  flex: 1,
                }}
              >
                <View style={styles.rowTop}>
                  <Text style={styles.name}>{m.name}</Text>
                  <Text style={styles.time}>{timeAgo(m.time)}</Text>
                </View>
                <View style={styles.rowBottom}>
                  <Text style={styles.last} numberOfLines={1}>
                    {m.last}
                  </Text>
                  {m.unread > 0 && (
                    <View style={styles.unread}>
                      <Text style={styles.unreadText}>{m.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = themedStyles((colors) => ({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    height: 48,
    borderRadius: radii.lg,
    ...shadow.soft,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  last: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  unread: {
    backgroundColor: colors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
}));
