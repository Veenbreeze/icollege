import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, radii, spacing, shadow, themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { FilterChips } from '@/components/ui/FilterChips';
import { useApi } from '@/hooks/useApi';
import { fetchOpportunities, fetchProjects, joinProject } from '@/lib/api/career';
import { resolveAccent } from '@/lib/colorKey';
import { opportunityCategories } from '@/data/mock';
export default function CareerScreen() {
  const router = useRouter();
  const { saved: savedParam } = useLocalSearchParams();
  const onlySaved = savedParam === '1';
  const [tab, setTab] = useState('opps');
  const [cat, setCat] = useState('All');
  const [query, setQuery] = useState('');
  const { data: opportunities, isLoading: loadingOpps } = useApi(() => fetchOpportunities(cat), [cat]);
  const { data: projects, isLoading: loadingProjects, refetch: refetchProjects } = useApi(fetchProjects);
  const visibleOpportunities = (opportunities ?? [])
    .filter((o) => !onlySaved || o.saved)
    .filter((o) => {
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        o.role.toLowerCase().includes(q) ||
        o.company.toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={onlySaved ? 'Saved Items' : 'iCareer'}
        subtitle={onlySaved ? 'Opportunities you bookmarked' : 'Opportunities & projects for you'}
        right={
          <Pressable style={styles.portfolioBtn} onPress={() => router.push('/portfolio')}>
            <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.portfolioText}>Portfolio</Text>
          </Pressable>
        }
      />

      {/* Segmented */}
      <View style={styles.segment}>
        {[
          ['opps', 'Opportunities'],
          ['projects', 'Projects'],
        ].map(([key, label]) => {
          const active = tab === key;
          return (
            <Pressable key={key} style={[styles.segItem, active && styles.segItemOn]} onPress={() => setTab(key)}>
              <Text
                style={[
                  styles.segText,
                  active && {
                    color: colors.white,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'opps' ? (
        <>
          {/* Search */}
          <View style={styles.search}>
            <Ionicons name="search" size={19} color={colors.textMuted} />
            <TextInput
              placeholder="Search jobs, internships, scholarships..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
            />
          </View>

          <FilterChips options={opportunityCategories} value={cat} onChange={setCat} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 40,
            }}
          >
            <Text style={styles.count}>{visibleOpportunities.length} opportunities · matched to your skills</Text>
            {loadingOpps && (
              <ActivityIndicator
                color={colors.primary}
                style={{
                  marginTop: spacing.lg,
                }}
              />
            )}
            {!loadingOpps && onlySaved && visibleOpportunities.length === 0 && (
              <Text style={styles.emptyText}>
                No saved opportunities yet. Tap the bookmark icon on any listing to save it here.
              </Text>
            )}
            {visibleOpportunities.map((o) => (
              <OpportunityCard key={o.id} opp={o} onPress={() => router.push(`/opportunity/${o.id}`)} />
            ))}
          </ScrollView>
        </>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        >
          <View style={styles.projectsIntro}>
            <Text style={styles.count}>Build something. Recruit teammates.</Text>
          </View>
          {loadingProjects && (
            <ActivityIndicator
              color={colors.primary}
              style={{
                marginTop: spacing.lg,
              }}
            />
          )}
          {(projects ?? []).map((p) => (
            <ProjectCard key={p.id} project={p} onToggle={() => joinProject(p.id).then(refetchProjects)} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
function OpportunityCard({ opp, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.oppCard}>
        <View style={styles.oppTop}>
          <View
            style={[
              styles.logo,
              {
                backgroundColor: colors.surfaceMuted,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 24,
              }}
            >
              {opp.logo}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
            }}
          >
            <Text style={styles.oppRole}>{opp.role}</Text>
            <View style={styles.companyRow}>
              <Text style={styles.oppCompany}>{opp.company}</Text>
              {opp.verified && <Ionicons name="checkmark-circle" size={13} color={colors.blue} />}
            </View>
          </View>
          <View
            style={[
              styles.matchPill,
              {
                backgroundColor: colors.greenSoft,
              },
            ]}
          >
            <Ionicons name="sparkles" size={11} color={colors.green} />
            <Text style={styles.matchText}>{opp.matched}%</Text>
          </View>
        </View>

        <View style={styles.oppMetaRow}>
          <Meta icon="briefcase-outline" label={opp.type} />
          <Meta icon="location-outline" label={`${opp.location} · ${opp.mode}`} />
        </View>
        <View style={styles.oppMetaRow}>
          <Meta icon="cash-outline" label={opp.pay} />
          <Meta icon="calendar-outline" label={opp.deadline ? `Apply by ${opp.deadline}` : 'No deadline'} />
        </View>

        <View style={styles.tagRow}>
          {opp.tags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Pressable>
  );
}
function ProjectCard({ project, onToggle }) {
  const { color, soft } = resolveAccent(project.colorKey);
  const statusColor =
    project.status === 'Recruiting'
      ? colors.green
      : project.status === 'In Progress'
        ? colors.orange
        : colors.textMuted;
  const statusSoft =
    project.status === 'Recruiting'
      ? colors.greenSoft
      : project.status === 'In Progress'
        ? colors.orangeSoft
        : colors.surfaceMuted;
  return (
    <Card style={styles.projectCard}>
      <View style={styles.projectTop}>
        <View
          style={[
            styles.logo,
            {
              backgroundColor: soft,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 24,
            }}
          >
            {project.emoji}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
          }}
        >
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.projectOwner}>by {project.owner}</Text>
        </View>
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: statusSoft,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: statusColor,
              },
            ]}
          >
            {project.status}
          </Text>
        </View>
      </View>

      <Text style={styles.projectTagline}>{project.tagline}</Text>

      <View style={styles.tagRow}>
        {project.skills.map((s) => (
          <View key={s} style={styles.tag}>
            <Text style={styles.tagText}>{s}</Text>
          </View>
        ))}
      </View>

      <View style={styles.projectFooter}>
        <View style={styles.teamRow}>
          <Ionicons name="people-outline" size={15} color={colors.textMuted} />
          <Text style={styles.teamText}>
            {project.members}/{project.needed} members
          </Text>
        </View>
        {project.status === 'Recruiting' && (
          <Pressable
            style={[
              styles.joinProject,
              project.joined
                ? styles.joinedProject
                : {
                    backgroundColor: color,
                  },
            ]}
            onPress={onToggle}
          >
            <Text
              style={[
                styles.joinProjectText,
                {
                  color: project.joined ? color : colors.white,
                },
              ]}
            >
              {project.joined ? 'Leave' : 'Join Team'}
            </Text>
          </Pressable>
        )}
      </View>
    </Card>
  );
}
function Meta({ icon, label }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}
const styles = themedStyles((colors) => ({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  portfolioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  portfolioText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radii.pill,
    padding: 4,
    ...shadow.soft,
  },
  segItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radii.pill,
  },
  segItemOn: {
    backgroundColor: colors.primary,
  },
  segText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
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
  count: {
    fontSize: 12.5,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  oppCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  oppTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oppRole: {
    fontSize: 15.5,
    fontWeight: '700',
    color: colors.text,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  oppCompany: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  matchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  matchText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.green,
  },
  oppMetaRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  meta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  tagText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  projectsIntro: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  projectCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  projectTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  projectTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: colors.text,
  },
  projectOwner: {
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  projectTagline: {
    fontSize: 13.5,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 19,
  },
  projectFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  teamText: {
    fontSize: 12.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  joinProject: {
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  joinedProject: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  joinProjectText: {
    fontSize: 13,
    fontWeight: '700',
  },
}));
