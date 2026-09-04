import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, shadow , themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import {
  opportunityCategories,
  opportunities,
  projects,
  type Opportunity,
  type Project,
} from '@/data/mock';

export default function CareerScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'opps' | 'projects'>('opps');
  const [cat, setCat] = useState('All');

  const filtered = useMemo(
    () => (cat === 'All' ? opportunities : opportunities.filter((o) => o.category === cat)),
    [cat],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.title}>iCareer</Text>
          <Text style={styles.subtitle}>Opportunities & projects for you</Text>
        </View>
        <Pressable style={styles.portfolioBtn} onPress={() => router.push('/portfolio')}>
          <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.portfolioText}>Portfolio</Text>
        </Pressable>
      </View>

      {/* Segmented */}
      <View style={styles.segment}>
        {([['opps', 'Opportunities'], ['projects', 'Projects']] as const).map(([key, label]) => {
          const active = tab === key;
          return (
            <Pressable key={key} style={[styles.segItem, active && styles.segItemOn]} onPress={() => setTab(key)}>
              <Text style={[styles.segText, active && { color: colors.white }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'opps' ? (
        <>
          {/* Search */}
          <View style={styles.search}>
            <Ionicons name="search" size={19} color={colors.textMuted} />
            <TextInput placeholder="Search jobs, internships, scholarships..." placeholderTextColor={colors.textMuted} style={styles.searchInput} />
          </View>

          {/* Category chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {opportunityCategories.map((c) => {
              const active = c === cat;
              return (
                <Pressable key={c} style={[styles.chip, active ? styles.chipOn : styles.chipOff]} onPress={() => setCat(c)}>
                  <Text style={[styles.chipText, { color: active ? colors.white : colors.textSecondary }]}>{c}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.count}>{filtered.length} opportunities · AI-matched to your profile</Text>
            {filtered.map((o) => (
              <OpportunityCard key={o.id} opp={o} onPress={() => router.push(`/opportunity/${o.id}` as any)} />
            ))}
          </ScrollView>
        </>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.projectsIntro}>
            <Text style={styles.count}>Build something. Recruit teammates.</Text>
            <Pressable style={styles.newProject}>
              <Ionicons name="add" size={16} color={colors.white} />
              <Text style={styles.newProjectText}>New Project</Text>
            </Pressable>
          </View>
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function OpportunityCard({ opp, onPress }: { opp: Opportunity; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.oppCard}>
        <View style={styles.oppTop}>
          <View style={[styles.logo, { backgroundColor: opp.soft }]}>
            <Text style={{ fontSize: 24 }}>{opp.logo}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.oppRole}>{opp.role}</Text>
            <View style={styles.companyRow}>
              <Text style={styles.oppCompany}>{opp.company}</Text>
              {opp.verified && <Ionicons name="checkmark-circle" size={13} color={colors.blue} />}
            </View>
          </View>
          <View style={[styles.matchPill, { backgroundColor: colors.greenSoft }]}>
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
          <Meta icon="calendar-outline" label={`Apply by ${opp.deadline}`} />
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

function ProjectCard({ project }: { project: Project }) {
  const [joined, setJoined] = useState(false);
  const statusColor =
    project.status === 'Recruiting' ? colors.green : project.status === 'In Progress' ? colors.orange : colors.textMuted;
  const statusSoft =
    project.status === 'Recruiting' ? colors.greenSoft : project.status === 'In Progress' ? colors.orangeSoft : colors.surfaceMuted;

  return (
    <Card style={styles.projectCard}>
      <View style={styles.projectTop}>
        <View style={[styles.logo, { backgroundColor: project.soft }]}>
          <Text style={{ fontSize: 24 }}>{project.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.projectOwner}>by {project.owner}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusSoft }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{project.status}</Text>
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
          <Text style={styles.teamText}>{project.members}/{project.needed} members</Text>
        </View>
        {project.status === 'Recruiting' && (
          <Pressable
            style={[styles.joinProject, joined ? styles.joinedProject : { backgroundColor: project.color }]}
            onPress={() => setJoined((j) => !j)}
          >
            <Text style={[styles.joinProjectText, { color: joined ? project.color : colors.white }]}>
              {joined ? 'Requested' : 'Join Team'}
            </Text>
          </Pressable>
        )}
      </View>
    </Card>
  );
}

function Meta({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  portfolioBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primarySoft, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill },
  portfolioText: { fontSize: 12, fontWeight: '700', color: colors.primary },

  segment: { flexDirection: 'row', backgroundColor: colors.surface, marginHorizontal: spacing.lg, marginTop: spacing.lg, borderRadius: radii.pill, padding: 4, ...shadow.soft },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radii.pill },
  segItemOn: { backgroundColor: colors.primary },
  segText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },

  search: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface,
    marginHorizontal: spacing.lg, marginTop: spacing.lg, paddingHorizontal: spacing.lg, height: 50, borderRadius: radii.lg, ...shadow.soft,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },

  chips: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, gap: spacing.sm },
  chip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.pill },
  chipOn: { backgroundColor: colors.primary },
  chipOff: { backgroundColor: colors.surface, ...shadow.soft },
  chipText: { fontSize: 13, fontWeight: '600' },

  count: { fontSize: 12.5, color: colors.textMuted, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },

  oppCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  oppTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logo: { width: 48, height: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  oppRole: { fontSize: 15.5, fontWeight: '700', color: colors.text },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  oppCompany: { fontSize: 13, color: colors.textSecondary },
  matchPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill },
  matchText: { fontSize: 11, fontWeight: '800', color: colors.green },
  oppMetaRow: { flexDirection: 'row', marginTop: spacing.md },
  meta: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12.5, color: colors.textSecondary },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  tag: { backgroundColor: colors.surfaceMuted, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radii.sm },
  tagText: { fontSize: 11.5, color: colors.textSecondary, fontWeight: '600' },

  projectsIntro: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  newProject: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill },
  newProjectText: { fontSize: 12.5, fontWeight: '700', color: colors.white },

  projectCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  projectTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  projectTitle: { fontSize: 15.5, fontWeight: '700', color: colors.text },
  projectOwner: { fontSize: 12.5, color: colors.textMuted, marginTop: 1 },
  statusPill: { paddingHorizontal: spacing.md, paddingVertical: 3, borderRadius: radii.pill },
  statusText: { fontSize: 10.5, fontWeight: '700' },
  projectTagline: { fontSize: 13.5, color: colors.textSecondary, marginTop: spacing.md, lineHeight: 19 },
  projectFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  teamText: { fontSize: 12.5, color: colors.textSecondary, fontWeight: '600' },
  joinProject: { borderWidth: 1.5, borderColor: 'transparent', borderRadius: radii.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  joinedProject: { backgroundColor: colors.surface, borderColor: colors.border },
  joinProjectText: { fontSize: 13, fontWeight: '700' },
}));
