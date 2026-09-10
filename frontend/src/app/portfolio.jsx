import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useApi } from '@/hooks/useApi';
import { fetchPortfolio } from '@/lib/api/career';
import { resolveAccent } from '@/lib/colorKey';
import { initialsOf } from '@/lib/initials';
export default function PortfolioScreen() {
  const router = useRouter();
  const { data: p, isLoading } = useApi(fetchPortfolio);
  if (isLoading || !p) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator
          color={colors.primary}
          style={{
            marginTop: spacing.xxl,
          }}
        />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Portfolio</Text>
          <View
            style={{
              width: 24,
            }}
          />
        </View>

        {/* Identity */}
        <View style={styles.identity}>
          <Avatar initials={initialsOf(p.fullName)} size={84} ring />
          <Text style={styles.name}>{p.fullName}</Text>
          {!!p.headline && <Text style={styles.headline}>{p.headline}</Text>}
          {!!p.location && (
            <View style={styles.locRow}>
              <Ionicons name="location-outline" size={13} color={colors.textMuted} />
              <Text style={styles.location}>{p.location}</Text>
            </View>
          )}
          {p.open && (
            <View style={styles.openBadge}>
              <View style={styles.openDot} />
              <Text style={styles.openText}>Open to opportunities</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <Stat value={String(p.successScore)} label="Success Score" color={colors.primary} />
          <View style={styles.vDiv} />
          {p.stats.map((s, i) => (
            <View key={s.label} style={styles.statWrap}>
              <Stat value={s.value} label={s.label} color={colors.text} />
              {i < p.stats.length - 1 && <View style={styles.vDiv} />}
            </View>
          ))}
        </Card>

        {/* About */}
        {!!p.about && (
          <Section title="About">
            <Text style={styles.about}>{p.about}</Text>
          </Section>
        )}

        {/* Skills */}
        {p.skills.length > 0 && (
          <Section title="Skills">
            <View style={styles.tagRow}>
              {p.skills.map((s) => (
                <View key={s} style={styles.skillTag}>
                  <Text style={styles.skillText}>{s}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Experience */}
        {p.experience.length > 0 && (
          <Section title="Experience">
            {p.experience.map((e) => (
              <View key={e.id} style={styles.timelineItem}>
                <View style={styles.timelineDotWrap}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor: resolveAccent(e.colorKey).color,
                      },
                    ]}
                  />
                  <View style={styles.timelineLine} />
                </View>
                <View
                  style={{
                    flex: 1,
                    paddingBottom: spacing.lg,
                  }}
                >
                  <Text style={styles.itemTitle}>{e.role}</Text>
                  <Text style={styles.itemSub}>
                    {e.org} · {e.period}
                  </Text>
                  <Text style={styles.itemDesc}>{e.desc}</Text>
                </View>
              </View>
            ))}
          </Section>
        )}

        {/* Projects */}
        {p.projectsList.length > 0 && (
          <Section title="Projects">
            {p.projectsList.map((pr) => (
              <Card key={pr.id} style={styles.rowCard}>
                <View
                  style={[
                    styles.rowIcon,
                    {
                      backgroundColor: colors.surfaceMuted,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 22,
                    }}
                  >
                    {pr.emoji}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text style={styles.itemTitle}>{pr.name}</Text>
                  <Text style={styles.itemSub}>{pr.tag}</Text>
                </View>
              </Card>
            ))}
          </Section>
        )}

        {/* Certifications */}
        {p.certifications.length > 0 && (
          <Section title="Certifications">
            {p.certifications.map((c) => (
              <Card key={c.id} style={styles.rowCard}>
                <View
                  style={[
                    styles.rowIcon,
                    {
                      backgroundColor: colors.blueSoft,
                    },
                  ]}
                >
                  <Ionicons name="ribbon-outline" size={20} color={resolveAccent(c.colorKey).color} />
                </View>
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text style={styles.itemTitle}>{c.name}</Text>
                  <Text style={styles.itemSub}>
                    {c.issuer} · {c.year}
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={18} color={colors.green} />
              </Card>
            ))}
          </Section>
        )}

        {/* Competitions */}
        {p.competitions.length > 0 && (
          <Section title="Competitions">
            {p.competitions.map((k) => (
              <Card key={k.id} style={styles.rowCard}>
                <View
                  style={[
                    styles.rowIcon,
                    {
                      backgroundColor: colors.yellowSoft,
                    },
                  ]}
                >
                  <Ionicons name="trophy-outline" size={20} color={colors.yellow} />
                </View>
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text style={styles.itemTitle}>{k.name}</Text>
                  <Text style={styles.itemSub}>{k.year}</Text>
                </View>
                <Text style={styles.result}>{k.result}</Text>
              </Card>
            ))}
          </Section>
        )}

        {/* Education */}
        {p.education.length > 0 && (
          <Section title="Education">
            {p.education.map((ed) => (
              <Card key={ed.id} style={styles.rowCard}>
                <View
                  style={[
                    styles.rowIcon,
                    {
                      backgroundColor: colors.primarySoft,
                    },
                  ]}
                >
                  <Ionicons name="school-outline" size={20} color={resolveAccent(ed.colorKey).color} />
                </View>
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text style={styles.itemTitle}>{ed.school}</Text>
                  <Text style={styles.itemSub}>
                    {ed.degree} · {ed.period}
                  </Text>
                </View>
              </Card>
            ))}
          </Section>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}
function Stat({ value, label, color }) {
  return (
    <View style={styles.stat}>
      <Text
        style={[
          styles.statValue,
          {
            color,
          },
        ]}
      >
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  identity: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  name: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.md,
  },
  headline: {
    fontSize: 13.5,
    color: colors.textSecondary,
    marginTop: 3,
    textAlign: 'center',
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  location: {
    fontSize: 12.5,
    color: colors.textMuted,
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.greenSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    marginTop: spacing.md,
  },
  openDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  openText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.green,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
  },
  statWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 19,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  vDiv: {
    width: 1,
    height: 34,
    backgroundColor: colors.border,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  about: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skillTag: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.sm,
  },
  skillText: {
    fontSize: 12.5,
    color: colors.primary,
    fontWeight: '600',
  },
  timelineItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineDotWrap: {
    alignItems: 'center',
    width: 14,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 3,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  itemTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
  },
  itemSub: {
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 19,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  result: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.text,
  },
}));
