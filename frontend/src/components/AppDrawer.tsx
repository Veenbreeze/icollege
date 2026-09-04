import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  Switch,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, shadow, themedStyles, useTheme } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { user } from '@/data/mock';

const PANEL_WIDTH = Math.min(320, Dimensions.get('window').width * 0.82);

type NavItem = { label: string; icon: string; color: string; route?: string; soon?: boolean };

const NAV: NavItem[] = [
  { label: 'My Portfolio', icon: 'person-circle-outline', color: colors.blue, route: '/portfolio' },
  { label: 'iCareer', icon: 'briefcase-outline', color: colors.green, route: '/career' },
  { label: 'iAI Assistant', icon: 'sparkles-outline', color: colors.primary, route: '/ai' },
  { label: 'iVault', icon: 'folder-outline', color: colors.green, route: '/documents' },
  { label: 'Clubs & Events', icon: 'calendar-outline', color: colors.orange, route: '/clubs' },
  { label: 'Timetable', icon: 'time-outline', color: colors.primary, route: '/timetable' },
  { label: 'Library', icon: 'book-outline', color: colors.blue, soon: true },
  { label: 'Settings', icon: 'settings-outline', color: colors.textSecondary, soon: true },
];

export function AppDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const { isDark, toggle } = useTheme();
  const styles = drawerStyles;

  const translateX = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const scrim = useRef(new Animated.Value(0)).current;
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 240, useNativeDriver: true }),
        Animated.timing(scrim, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -PANEL_WIDTH, duration: 200, useNativeDriver: true }),
        Animated.timing(scrim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(({ finished }) => finished && setRendered(false));
    }
  }, [visible, translateX, scrim]);

  const go = (item: NavItem) => {
    onClose();
    if (item.route) requestAnimationFrame(() => router.push(item.route as any));
  };

  if (!rendered) return null;

  return (
    <Modal transparent visible statusBarTranslucent onRequestClose={onClose} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.scrim, { opacity: scrim }]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.panel, { transform: [{ translateX }] }]}>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            {/* Profile header */}
            <Pressable style={styles.profile} onPress={() => go({ label: '', icon: '', color: '', route: '/portfolio' })}>
              <Avatar initials={user.avatarInitials} size={54} ring />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{user.fullName}</Text>
                <Text style={styles.sub}>{user.year} · {user.programme}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: spacing.sm }}>
              {NAV.map((item) => (
                <Pressable key={item.label} style={styles.navRow} onPress={() => go(item)}>
                  <View style={[styles.navIcon, { backgroundColor: colors.surfaceMuted }]}>
                    <Ionicons name={item.icon as any} size={19} color={item.color} />
                  </View>
                  <Text style={styles.navLabel}>{item.label}</Text>
                  {item.soon && (
                    <View style={styles.soonPill}>
                      <Text style={styles.soonText}>Soon</Text>
                    </View>
                  )}
                </Pressable>
              ))}

              {/* Dark mode toggle */}
              <View style={styles.divider} />
              <View style={styles.navRow}>
                <View style={[styles.navIcon, { backgroundColor: colors.surfaceMuted }]}>
                  <Ionicons name={isDark ? 'moon' : 'moon-outline'} size={19} color={colors.primary} />
                </View>
                <Text style={styles.navLabel}>Dark Mode</Text>
                <Switch
                  value={isDark}
                  onValueChange={toggle}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor={colors.white}
                />
              </View>
            </ScrollView>

            {/* Log out */}
            <Pressable
              style={styles.logout}
              onPress={() => {
                onClose();
                requestAnimationFrame(() => router.replace('/auth/login'));
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.red} />
              <Text style={styles.logoutText}>Log Out</Text>
            </Pressable>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const drawerStyles = themedStyles((colors) => ({
  overlay: { flex: 1, flexDirection: 'row' },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  panel: {
    width: PANEL_WIDTH,
    height: '100%',
    backgroundColor: colors.surface,
    borderTopRightRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    ...shadow.card,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  navRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  navIcon: { width: 38, height: 38, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  navLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  soonPill: { backgroundColor: colors.surfaceMuted, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.pill },
  soonText: { fontSize: 10, fontWeight: '700', color: colors.textMuted },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm, marginHorizontal: spacing.lg },

  logout: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    marginHorizontal: spacing.lg, marginBottom: spacing.md, paddingVertical: spacing.md,
    backgroundColor: colors.redSoft, borderRadius: radii.md,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.red },
}));
