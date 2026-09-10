import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, shadow , themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { clubs, events, type Club, type EventItem } from '@/data/mock';

export default function ClubsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'events' | 'clubs'>('events');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.title}>Clubs & Events</Text>
          <Text style={styles.subtitle}>Discover, join & attend</Text>
        </View>
        <Ionicons name="search-outline" size={22} color={colors.text} />
      </View>

      {/* Segmented */}
      <View style={styles.segment}>
        {([['events', 'Events'], ['clubs', 'Clubs']] as const).map(([key, label]) => {
          const active = tab === key;
          return (
            <Pressable key={key} style={[styles.segItem, active && styles.segItemOn]} onPress={() => setTab(key)}>
              <Text style={[styles.segText, active && { color: colors.white }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {tab === 'events' ? (
          <>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Explore Clubs</Text>
            {clubs.map((c) => (
              <ClubCard key={c.id} club={c} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const [registered, setRegistered] = useState(event.registered);
  return (
    <Card style={styles.eventCard}>
      <View style={styles.eventTop}>
        <View style={[styles.dateChip, { backgroundColor: event.soft }]}>
          <Text style={[styles.dateDay, { color: event.color }]}>{event.day}</Text>
          <Text style={[styles.dateMonth, { color: event.color }]}>{event.month}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={[styles.typePill, { backgroundColor: event.soft }]}>
            <Text style={[styles.typeText, { color: event.color }]}>{event.type}</Text>
          </View>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventHost}>by {event.host}</Text>
        </View>
        <Text style={{ fontSize: 30 }}>{event.emoji}</Text>
      </View>

      <View style={styles.eventMetaRow}>
        <View style={styles.eventMeta}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={styles.eventMetaText}>{event.time}</Text>
        </View>
        <View style={styles.eventMeta}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.eventMetaText}>{event.venue}</Text>
        </View>
        <View style={styles.eventMeta}>
          <Ionicons name="people-outline" size={14} color={colors.textMuted} />
          <Text style={styles.eventMetaText}>{event.attending} going</Text>
        </View>
      </View>

      <View style={styles.eventActions}>
        <Pressable
          style={[styles.registerBtn, registered ? styles.registeredBtn : { backgroundColor: event.color }]}
          onPress={() => setRegistered((r) => !r)}
        >
          <Ionicons
            name={registered ? 'checkmark-circle' : 'add-circle-outline'}
            size={16}
            color={registered ? event.color : colors.white}
          />
          <Text style={[styles.registerText, { color: registered ? event.color : colors.white }]}>
            {registered ? 'Registered' : 'Register'}
          </Text>
        </Pressable>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
        </Pressable>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="share-social-outline" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>
    </Card>
  );
}

function ClubCard({ club }: { club: Club }) {
  const [joined, setJoined] = useState(club.joined);
  return (
    <Card style={styles.clubCard}>
      <View style={[styles.clubIcon, { backgroundColor: club.soft }]}>
        <Text style={{ fontSize: 26 }}>{club.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.clubName}>{club.name}</Text>
        <View style={styles.clubMetaRow}>
          <View style={[styles.catPill, { backgroundColor: club.soft }]}>
            <Text style={[styles.catText, { color: club.color }]}>{club.category}</Text>
          </View>
          <Text style={styles.clubMembers}>{club.members} members</Text>
        </View>
      </View>
      <Pressable
        style={[styles.joinBtn, joined ? { borderColor: club.color } : { backgroundColor: club.color, borderColor: club.color }]}
        onPress={() => setJoined((j) => !j)}
      >
        <Text style={[styles.joinText, { color: joined ? club.color : colors.white }]}>{joined ? 'Joined' : 'Join'}</Text>
      </Pressable>
    </Card>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },

  segment: { flexDirection: 'row', backgroundColor: colors.surface, marginHorizontal: spacing.lg, marginTop: spacing.lg, borderRadius: radii.pill, padding: 4, ...shadow.soft },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radii.pill },
  segItemOn: { backgroundColor: colors.primary },
  segText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, paddingHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.sm },

  eventCard: { marginHorizontal: spacing.lg, marginTop: spacing.md },
  eventTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  dateChip: { width: 52, height: 56, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  dateDay: { fontSize: 20, fontWeight: '800' },
  dateMonth: { fontSize: 10, fontWeight: '700' },
  typePill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.pill, marginBottom: 4 },
  typeText: { fontSize: 10, fontWeight: '700' },
  eventTitle: { fontSize: 15.5, fontWeight: '700', color: colors.text },
  eventHost: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  eventMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventMetaText: { fontSize: 12, color: colors.textSecondary },
  eventActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  registerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 42, borderRadius: radii.md },
  registeredBtn: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.green },
  registerText: { fontSize: 14, fontWeight: '700' },
  iconBtn: { width: 42, height: 42, borderRadius: radii.md, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },

  clubCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.lg, marginTop: spacing.md },
  clubIcon: { width: 54, height: 54, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center' },
  clubName: { fontSize: 15, fontWeight: '700', color: colors.text },
  clubMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  catPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.pill },
  catText: { fontSize: 10, fontWeight: '700' },
  clubMembers: { fontSize: 11.5, color: colors.textMuted },
  joinBtn: { borderWidth: 1.5, borderRadius: radii.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  joinText: { fontSize: 13, fontWeight: '700' },
}));
