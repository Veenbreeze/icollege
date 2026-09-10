import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { useApi } from '@/hooks/useApi';
import { fetchOpportunity, saveOpportunity, applyToOpportunity } from '@/lib/api/career';
import { ApiError } from '@/lib/api/client';
export default function OpportunityScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: opp, isLoading, refetch } = useApi(() => fetchOpportunity(id), [id]);
  const [savingOrApplying, setSavingOrApplying] = useState(false);
  const [actionError, setActionError] = useState(null);
  if (isLoading || !opp) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ActivityIndicator
          color={colors.primary}
          style={{
            marginTop: spacing.xxl,
          }}
        />
      </SafeAreaView>
    );
  }
  const saved = opp.saved;
  const applied = opp.applied;
  const onToggleSave = async () => {
    setActionError(null);
    try {
      await saveOpportunity(opp.id);
      refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Could not save. Please try again.');
    }
  };
  const onApply = async () => {
    if (applied || savingOrApplying) return;
    setActionError(null);
    setSavingOrApplying(true);
    try {
      await applyToOpportunity(opp.id);
      refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Could not submit your application. Please try again.');
    } finally {
      setSavingOrApplying(false);
    }
  };
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Pressable onPress={onToggleSave} hitSlop={8}>
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={saved ? colors.primary : colors.text}
          />
        </Pressable>
      </View>
      {actionError && <Text style={styles.actionError}>{actionError}</Text>}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: spacing.lg,
        }}
      >
        {/* Company hero */}
        <View style={styles.hero}>
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
                fontSize: 34,
              }}
            >
              {opp.logo}
            </Text>
          </View>
          <Text style={styles.role}>{opp.role}</Text>
          <View style={styles.companyRow}>
            <Text style={styles.company}>{opp.company}</Text>
            {opp.verified && <Ionicons name="checkmark-circle" size={15} color={colors.blue} />}
          </View>
          <View
            style={[
              styles.matchBanner,
              {
                backgroundColor: colors.greenSoft,
              },
            ]}
          >
            <Ionicons name="sparkles" size={14} color={colors.green} />
            <Text style={styles.matchText}>{opp.matched}% match with your skills</Text>
          </View>
        </View>

        {/* Meta grid */}
        <Card style={styles.metaCard}>
          <MetaCell icon="briefcase-outline" label="Type" value={opp.type} />
          <View style={styles.vDiv} />
          <MetaCell icon="location-outline" label="Location" value={`${opp.location} · ${opp.mode}`} />
        </Card>
        <Card
          style={[
            styles.metaCard,
            {
              marginTop: spacing.sm,
            },
          ]}
        >
          <MetaCell icon="cash-outline" label="Compensation" value={opp.pay} />
          <View style={styles.vDiv} />
          <MetaCell icon="calendar-outline" label="Deadline" value={opp.deadline ?? 'Rolling'} />
        </Card>

        {/* Skills */}
        <Section title="Skills">
          <View style={styles.tagRow}>
            {opp.tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* About */}
        <Section title="About this opportunity">
          <Text style={styles.body}>{opp.about}</Text>
        </Section>

        {/* Responsibilities */}
        <Section title="What you'll do">
          {opp.responsibilities.map((r) => (
            <Bullet key={r} text={r} color={colors.primary} />
          ))}
        </Section>

        {/* Requirements */}
        <Section title="Requirements">
          {opp.requirements.map((r) => (
            <Bullet key={r} text={r} icon="checkmark-circle" color={colors.green} />
          ))}
        </Section>
      </ScrollView>

      {/* Apply bar */}
      <View style={styles.applyBar}>
        <Pressable style={styles.saveBtn} onPress={onToggleSave}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={colors.primary} />
        </Pressable>
        <Pressable
          style={[styles.applyBtn, applied && styles.appliedBtn]}
          onPress={onApply}
          disabled={applied || savingOrApplying}
        >
          {savingOrApplying ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Ionicons name={applied ? 'checkmark-circle' : 'paper-plane'} size={18} color={colors.white} />
              <Text style={styles.applyText}>{applied ? 'Application Sent' : 'Apply Now'}</Text>
            </>
          )}
        </Pressable>
      </View>
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
function MetaCell({ icon, label, value }) {
  return (
    <View style={styles.metaCell}>
      <View style={styles.metaIcon}>
        <Ionicons name={icon} size={17} color={colors.primary} />
      </View>
      <View
        style={{
          flex: 1,
        }}
      >
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{value}</Text>
      </View>
    </View>
  );
}
function Bullet({ text, icon, color }) {
  return (
    <View style={styles.bullet}>
      {icon ? (
        <Ionicons
          name={icon}
          size={16}
          color={color}
          style={{
            marginTop: 1,
          }}
        />
      ) : (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: color,
            },
          ]}
        />
      )}
      <Text style={styles.bulletText}>{text}</Text>
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
    paddingBottom: spacing.sm,
  },
  actionError: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.red,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  role: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  company: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    marginTop: spacing.md,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.green,
  },
  metaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  metaCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  metaValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.text,
  },
  vDiv: {
    width: 1,
    height: 34,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
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
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  tagText: {
    fontSize: 12.5,
    color: colors.primary,
    fontWeight: '600',
  },
  bullet: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  applyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveBtn: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
  },
  appliedBtn: {
    backgroundColor: colors.green,
  },
  applyText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
}));
