import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, shadow, themedStyles } from '@/theme';
const OPTIONS = [
  {
    key: 'post',
    label: 'Post',
    desc: 'Share an update',
    icon: 'create-outline',
    color: colors.primary,
    soft: colors.primarySoft,
    route: '/create-post',
  },
  {
    key: 'reel',
    label: 'Reel',
    desc: 'Short video',
    icon: 'play-circle-outline',
    color: colors.red,
    soft: colors.redSoft,
    route: '/create-reel',
  },
  {
    key: 'story',
    label: 'Story',
    desc: 'Expires in 24h',
    icon: 'aperture-outline',
    color: colors.orange,
    soft: colors.orangeSoft,
    route: '/create-story',
  },
  {
    key: 'project',
    label: 'Project',
    desc: 'Recruit teammates',
    icon: 'construct-outline',
    color: colors.blue,
    soft: colors.blueSoft,
    route: '/create-project',
  },
  {
    key: 'event',
    label: 'Event',
    desc: 'Seminar, workshop…',
    icon: 'calendar-outline',
    color: colors.green,
    soft: colors.greenSoft,
    route: '/create-event',
  },
  {
    key: 'material',
    label: 'Material',
    desc: 'Notes & documents',
    icon: 'document-attach-outline',
    color: colors.primary,
    soft: colors.primarySoft,
    route: '/documents',
  },
  {
    key: 'discussion',
    label: 'Discussion',
    desc: 'Start a thread',
    icon: 'chatbubbles-outline',
    color: colors.blue,
    soft: colors.blueSoft,
    route: '/create-post',
  },
];
export default function CreateScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Create</Text>
        <View
          style={{
            width: 26,
          }}
        />
      </View>
      <Text style={styles.subtitle}>What would you like to create today?</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {OPTIONS.map((o) => (
          <Pressable key={o.key} style={styles.card} onPress={() => 'route' in o && o.route && router.push(o.route)}>
            <View
              style={[
                styles.icon,
                {
                  backgroundColor: o.soft,
                },
              ]}
            >
              <Ionicons name={o.icon} size={26} color={o.color} />
            </View>
            <Text style={styles.label}>{o.label}</Text>
            <Text style={styles.desc}>{o.desc}</Text>
          </Pressable>
        ))}
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
    paddingTop: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 120,
  },
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadow.soft,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  desc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
}));
