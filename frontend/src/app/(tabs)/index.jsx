import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, shadow, themedStyles, useResponsive } from '@/theme';
import { AppDrawer } from '@/components/AppDrawer';
import { RoleHome } from '@/components/RoleHome';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { IconTile } from '@/components/ui/IconTile';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAuth } from '@/lib/auth/AuthContext';
import { useNotifications } from '@/lib/notifications/NotificationsContext';
import { useApi } from '@/hooks/useApi';
import { fetchTodayTimetable, fetchNotices } from '@/lib/api/academic';
import { fetchChambers } from '@/lib/api/community';
import { initialsOf, greetingForNow } from '@/lib/initials';
import { resolveMediaUrl } from '@/lib/api/client';
import { resolveAccent } from '@/lib/colorKey';
import { NAV_ITEMS } from '@/config/navigation';
import { recommended } from '@/data/mock';
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width: screenWidth, isTablet } = useResponsive();
  const heroWidth = isTablet ? 260 : Math.round(screenWidth * 0.6);
  const chamberCardWidth = isTablet ? 132 : Math.round(screenWidth * 0.28);
  const recCardWidth = isTablet ? 220 : Math.round(screenWidth * 0.5);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: today, isLoading: loadingTimetable } = useApi(fetchTodayTimetable);
  const { data: notices, isLoading: loadingNotices } = useApi(fetchNotices);
  const { data: chambers } = useApi(fetchChambers);
  const { unreadCount: unreadActivity } = useNotifications();
  if (!user) return null;
  if (user.role !== 'student') return <RoleHome />;
  const classes = today?.classes ?? [];
  const nextClass = classes.find((c) => c.status === 'current') ?? classes.find((c) => c.status === 'upcoming');
  const unreadNotices = (notices ?? []).filter((n) => !n.read);
  const priorityNotice = unreadNotices.find((n) => n.priority !== 'Normal') ?? unreadNotices[0];
  const quickActions = NAV_ITEMS.filter((i) => i.showInQuickActions).map((i) => ({
    ...i,
    badge: i.key === 'notices' ? unreadNotices.length > 0 : i.key === 'activity' ? unreadActivity > 0 : i.badge,
  }));
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 110,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => setDrawerOpen(true)} hitSlop={8}>
            <Ionicons name="menu" size={26} color={colors.text} />
          </Pressable>
          <View style={styles.logoWrap}>
            <View style={styles.logoRow}>
              <Ionicons name="school" size={22} color={colors.primary} />
              <Text style={styles.logoText}>iCollege</Text>
            </View>
            <Text style={styles.logoTagline}>Your Campus. Your Future.</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={() => router.push('/notifications')} hitSlop={6}>
              <Ionicons name="heart-outline" size={24} color={colors.text} />
              {unreadActivity > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadActivity}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => router.push('/notices')} hitSlop={6}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              {unreadNotices.length > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadNotices.length}</Text>
                </View>
              )}
            </Pressable>
            <View>
              <Avatar initials={initialsOf(user.fullName)} uri={resolveMediaUrl(user.avatarUrl)} size={38} ring />
              <View style={styles.onlineDot} />
            </View>
          </View>
        </View>

        {/* Search — opens AI Smart Search */}
        <Pressable style={styles.searchBar} onPress={() => router.push('/ai-search')}>
          <Ionicons name="search" size={19} color={colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Search classes, notices, people, documents...</Text>
          <Ionicons name="sparkles-outline" size={19} color={colors.primary} />
        </Pressable>

        {/* Greeting */}
        <View style={styles.greetRow}>
          <View
            style={{
              flex: 1,
            }}
          >
            <Text style={styles.greetTitle}>
              {greetingForNow()}, {user.fullName.split(' ')[0]}
            </Text>
            <Text style={styles.greetSub}>You have a productive day ahead!</Text>
          </View>
          <Pressable style={styles.scorePill} onPress={() => router.push('/portfolio')}>
            <Ionicons name="star" size={16} color={colors.yellow} />
            <Text style={styles.scoreLabel}>Success Score</Text>
            <Text style={styles.scoreValue}>{user.successScore}</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Hero cards */}
        {loadingTimetable || loadingNotices ? (
          <ActivityIndicator
            color={colors.primary}
            style={{
              marginTop: spacing.xl,
            }}
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.heroScroll}>
            {/* Next class */}
            <Pressable
              style={[
                styles.hero,
                {
                  width: heroWidth,
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => router.push('/timetable')}
            >
              <View style={styles.heroTop}>
                <Text style={styles.heroLabel}>NEXT CLASS</Text>
                <View style={styles.heroIcon}>
                  <Ionicons name="book" size={16} color={colors.white} />
                </View>
              </View>
              {nextClass ? (
                <>
                  <Text style={styles.heroTitle}>{nextClass.title}</Text>
                  <Text style={styles.heroMeta}>
                    {nextClass.start} – {nextClass.end}
                  </Text>
                  <Text style={styles.heroMeta}>{nextClass.room}</Text>
                  {nextClass.note && (
                    <View style={styles.heroFooterRow}>
                      <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.heroMetaSm}>{nextClass.note}</Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.heroTitle}>No more classes today</Text>
              )}
              <View style={styles.heroBtn}>
                <Text style={styles.heroBtnText}>View Details</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.white} />
              </View>
            </Pressable>

            {/* Today's classes */}
            <Pressable
              style={[
                styles.hero,
                {
                  width: heroWidth,
                  backgroundColor: colors.blue,
                },
              ]}
              onPress={() => router.push('/timetable')}
            >
              <View style={styles.heroTop}>
                <Text style={styles.heroLabel}>TODAY&apos;S CLASSES</Text>
                <View style={styles.heroIcon}>
                  <Ionicons name="calendar" size={16} color={colors.white} />
                </View>
              </View>
              <Text style={styles.heroBig}>{classes.length}</Text>
              <Text style={styles.heroMeta}>Classes Today</Text>
              <View style={styles.heroDivider} />
              <View style={styles.heroTimes}>
                {classes.slice(0, 3).map((c) => (
                  <Text key={c.id} style={styles.heroTime}>
                    {c.start}
                  </Text>
                ))}
              </View>
              <View style={styles.heroBtn}>
                <Text style={styles.heroBtnText}>View Timetable</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.white} />
              </View>
            </Pressable>

            {/* Announcements */}
            <Pressable
              style={[
                styles.hero,
                {
                  width: heroWidth,
                  backgroundColor: colors.green,
                },
              ]}
              onPress={() => router.push('/notices')}
            >
              <View style={styles.heroTop}>
                <Text style={styles.heroLabel}>ANNOUNCEMENTS</Text>
                <View style={styles.heroIcon}>
                  <Ionicons name="megaphone" size={16} color={colors.white} />
                </View>
              </View>
              <Text style={styles.heroBig}>{unreadNotices.length}</Text>
              <Text style={styles.heroMeta}>New Updates</Text>
              <View style={styles.heroDivider} />
              {unreadNotices.slice(0, 2).map((n) => (
                <Text key={n.id} style={styles.heroBullet} numberOfLines={1}>
                  • {n.title}
                </Text>
              ))}
              <View style={styles.heroBtn}>
                <Text style={styles.heroBtnText}>View All</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.white} />
              </View>
            </Pressable>
          </ScrollView>
        )}

        {/* Quick actions grid */}
        <Card style={styles.gridCard}>
          <View style={styles.grid}>
            {quickActions.map((a) => {
              const { color, soft } = resolveAccent(a.colorKey);
              return (
                <IconTile
                  key={a.key}
                  label={a.label}
                  icon={a.icon}
                  color={color}
                  soft={soft}
                  badge={a.badge}
                  onPress={() => a.route && router.push(a.route)}
                />
              );
            })}
          </View>
        </Card>

        {/* Alert banner */}
        {priorityNotice && (
          <Pressable style={styles.alert} onPress={() => router.push('/notices')}>
            <Ionicons name="megaphone" size={22} color={colors.orange} />
            <View
              style={{
                flex: 1,
              }}
            >
              <View style={styles.alertTitleRow}>
                <Text style={styles.alertTitle} numberOfLines={1}>
                  {priorityNotice.title}
                </Text>
                <View style={styles.importantPill}>
                  <Text style={styles.importantText}>{priorityNotice.priority}</Text>
                </View>
              </View>
              <Text style={styles.alertBody} numberOfLines={2}>
                {priorityNotice.body}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        )}

        {/* Page dots */}
        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
          ))}
        </View>

        {/* Explore Chambers */}
        <View style={styles.section}>
          <SectionHeader title="Explore Chambers" action="See All" onAction={() => router.push('/community')} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chamberScroll}>
          {(chambers ?? []).map((c) => (
            <Pressable key={c.id} style={[styles.chamberCard, { width: chamberCardWidth }]} onPress={() => router.push(`/chamber/${c.id}`)}>
              <View style={[styles.chamberThumb, { width: chamberCardWidth, height: Math.round(chamberCardWidth * 0.85) }]}>
                <Text
                  style={{
                    fontSize: 34,
                  }}
                >
                  {c.emoji}
                </Text>
              </View>
              <Text style={styles.chamberName} numberOfLines={1}>
                {c.name}
              </Text>
              <Text style={styles.chamberMembers}>{c.memberCount} Members</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Recommended */}
        <View style={styles.section}>
          <SectionHeader title="Recommended for You" action="View All" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chamberScroll}>
          {recommended.map((r) => (
            <Pressable
              key={r.key}
              style={[
                styles.recCard,
                {
                  width: recCardWidth,
                  backgroundColor: r.soft,
                },
              ]}
              onPress={() => r.route && router.push(r.route)}
            >
              <View
                style={[
                  styles.recIcon,
                  {
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <Ionicons name={r.icon} size={20} color={r.color} />
              </View>
              <Text
                style={[
                  styles.recTitle,
                  {
                    color: r.color,
                  },
                ]}
              >
                {r.title}
              </Text>
              <Text style={styles.recBody}>{r.body}</Text>
              <View
                style={[
                  styles.recBtn,
                  {
                    backgroundColor: r.color,
                  },
                ]}
              >
                <Text style={styles.recBtnText}>{r.cta}</Text>
                <Ionicons name="arrow-forward" size={13} color={colors.white} />
              </View>
            </Pressable>
          ))}
        </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  logoWrap: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  logoTagline: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  bellBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.red,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  searchBar: {
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
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: colors.textMuted,
  },
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  greetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  greetSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    ...shadow.soft,
  },
  scoreLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '800',
  },
  heroScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  hero: {
    width: 230,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadow.card,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 4,
  },
  heroBig: {
    color: colors.white,
    fontSize: 40,
    fontWeight: '800',
  },
  heroMeta: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    marginTop: 2,
  },
  heroMetaSm: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
  },
  heroFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.sm,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: spacing.sm,
  },
  heroTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroTime: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  heroBullet: {
    color: colors.white,
    fontSize: 12,
    marginTop: 3,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  heroBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  gridCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.lg,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.yellowSoft,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  importantPill: {
    backgroundColor: colors.orangeSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  importantText: {
    color: colors.orange,
    fontSize: 10,
    fontWeight: '700',
  },
  alertBody: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.lg,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 18,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  chamberScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  chamberCard: {
    width: 108,
  },
  chamberThumb: {
    width: 108,
    height: 92,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadow.soft,
  },
  chamberName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  chamberMembers: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  recCard: {
    width: 190,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  recIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  recBody: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
    minHeight: 51,
  },
  recBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  recBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
}));
