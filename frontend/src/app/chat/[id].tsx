import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radii, spacing, shadow , themedStyles } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { chatThreads, type ChatMessage } from '@/data/mock';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const thread = chatThreads[id ?? 'm1'] ?? chatThreads.m1;

  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(thread.messages);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setMessages((m) => [...m, { id: String(Date.now()), text: t, mine: true, time: 'now' }]);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Avatar initials={thread.initials} size={40} color={thread.color} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{thread.name}</Text>
          <Text style={styles.status}>
            {thread.isGroup ? thread.members : thread.online ? 'Online' : 'Last seen recently'}
          </Text>
        </View>
        <Ionicons name="call-outline" size={22} color={colors.primary} style={{ marginRight: spacing.md }} />
        <Ionicons name="videocam-outline" size={23} color={colors.primary} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dayPill}>
            <Text style={styles.dayText}>Today</Text>
          </View>
          {messages.map((m) => (
            <Bubble key={m.id} msg={m} isGroup={thread.isGroup} />
          ))}
        </ScrollView>

        {/* Composer */}
        <View style={styles.composer}>
          <Pressable style={styles.attach}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <Pressable style={styles.send} onPress={send}>
            <Ionicons name={draft.trim() ? 'send' : 'mic-outline'} size={20} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Bubble({ msg, isGroup }: { msg: ChatMessage; isGroup: boolean }) {
  if (msg.mine) {
    return (
      <View style={[styles.row, { justifyContent: 'flex-end' }]}>
        <View style={[styles.bubble, styles.bubbleMine]}>
          <Text style={styles.textMine}>{msg.text}</Text>
          <Text style={styles.timeMine}>{msg.time}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.row, { justifyContent: 'flex-start' }]}>
      <View style={[styles.bubble, styles.bubbleOther]}>
        {isGroup && msg.sender && (
          <Text style={[styles.sender, { color: msg.senderColor ?? colors.primary }]}>{msg.sender}</Text>
        )}
        <Text style={styles.textOther}>{msg.text}</Text>
        <Text style={styles.timeOther}>{msg.time}</Text>
      </View>
    </View>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md, backgroundColor: colors.surface, ...shadow.soft,
  },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  status: { fontSize: 12, color: colors.green, marginTop: 1 },

  messages: { padding: spacing.lg, gap: spacing.sm },
  dayPill: { alignSelf: 'center', backgroundColor: colors.surfaceMuted, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radii.pill, marginBottom: spacing.sm },
  dayText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },

  row: { flexDirection: 'row' },
  bubble: { maxWidth: '78%', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.lg },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: colors.surface, borderBottomLeftRadius: 4, ...shadow.soft },
  sender: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  textMine: { fontSize: 14.5, color: colors.white, lineHeight: 20 },
  textOther: { fontSize: 14.5, color: colors.text, lineHeight: 20 },
  timeMine: { fontSize: 10, color: 'rgba(255,255,255,0.75)', alignSelf: 'flex-end', marginTop: 3 },
  timeOther: { fontSize: 10, color: colors.textMuted, alignSelf: 'flex-end', marginTop: 3 },

  composer: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
  },
  attach: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1, minHeight: 40, maxHeight: 120, backgroundColor: colors.surfaceMuted, borderRadius: radii.xl,
    paddingHorizontal: spacing.lg, paddingTop: 10, paddingBottom: 10, fontSize: 14.5, color: colors.text,
  },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
}));
