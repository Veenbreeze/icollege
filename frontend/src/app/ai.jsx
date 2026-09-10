import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, shadow, themedStyles } from '@/theme';
import { chatReply } from '@/lib/api/ai';
import { useAuth } from '@/lib/auth/AuthContext';
import { aiCapabilities, aiSuggestions } from '@/data/mock';
export default function AiScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const started = messages.length > 0;
  const send = async (text) => {
    const t = text.trim();
    if (!t) return;
    const userMsg = {
      id: String(Date.now()),
      text: t,
      mine: true,
    };
    setMessages((m) => [...m, userMsg]);
    setDraft('');
    setThinking(true);
    try {
      const { reply } = await chatReply(t);
      setMessages((m) => [
        ...m,
        {
          id: String(Date.now() + 1),
          text: reply,
          mine: false,
        },
      ]);
    } finally {
      setThinking(false);
    }
  };
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Ionicons name="sparkles" size={16} color={colors.white} />
          </View>
          <View>
            <Text style={styles.brandName}>iAI</Text>
            <Text style={styles.brandSub}>Your AI study & career assistant</Text>
          </View>
        </View>
        <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
      </View>

      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{
            flex: 1,
          }}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {!started ? (
            <>
              {/* Intro */}
              <View style={styles.intro}>
                <View style={styles.introIcon}>
                  <Ionicons name="sparkles" size={30} color={colors.primary} />
                </View>
                <Text style={styles.introTitle}>Hi {user?.fullName.split(' ')[0]}, how can I help?</Text>
                <Text style={styles.introSub}>
                  Ask about your courses, get summaries and quizzes from your notes, find opportunities, or explore
                  campus.
                </Text>
              </View>

              {/* Capabilities */}
              <View style={styles.capGrid}>
                {aiCapabilities.map((c) => (
                  <Pressable
                    key={c.key}
                    style={styles.capCard}
                    onPress={() => (c.route ? router.push(c.route) : send(`Help me ${c.label.toLowerCase()}`))}
                  >
                    <View
                      style={[
                        styles.capIcon,
                        {
                          backgroundColor: c.soft,
                        },
                      ]}
                    >
                      <Ionicons name={c.icon} size={22} color={c.color} />
                    </View>
                    <Text style={styles.capLabel}>{c.label}</Text>
                    <Text style={styles.capDesc}>{c.desc}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Suggestions */}
              <Text style={styles.suggTitle}>Try asking</Text>
              {aiSuggestions.map((s) => (
                <Pressable key={s} style={styles.suggRow} onPress={() => send(s)}>
                  <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
                  <Text style={styles.suggText}>{s}</Text>
                  <Ionicons name="arrow-forward" size={15} color={colors.textMuted} />
                </Pressable>
              ))}
            </>
          ) : (
            messages.map((m) =>
              m.mine ? (
                <View
                  key={m.id}
                  style={[
                    styles.row,
                    {
                      justifyContent: 'flex-end',
                    },
                  ]}
                >
                  <View style={[styles.bubble, styles.bubbleMine]}>
                    <Text style={styles.textMine}>{m.text}</Text>
                  </View>
                </View>
              ) : (
                <View
                  key={m.id}
                  style={[
                    styles.row,
                    {
                      justifyContent: 'flex-start',
                    },
                  ]}
                >
                  <View style={styles.aiAvatar}>
                    <Ionicons name="sparkles" size={13} color={colors.white} />
                  </View>
                  <View style={[styles.bubble, styles.bubbleAi]}>
                    <Text style={styles.textAi}>{m.text}</Text>
                    <View style={styles.aiActions}>
                      <Ionicons name="copy-outline" size={15} color={colors.textMuted} />
                      <Ionicons name="thumbs-up-outline" size={15} color={colors.textMuted} />
                      <Ionicons name="refresh-outline" size={15} color={colors.textMuted} />
                    </View>
                  </View>
                </View>
              ),
            )
          )}
          {thinking && (
            <View
              style={[
                styles.row,
                {
                  justifyContent: 'flex-start',
                },
              ]}
            >
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={13} color={colors.white} />
              </View>
              <View style={[styles.bubble, styles.bubbleAi]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Composer */}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Ask iAI anything..."
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
            onSubmitEditing={() => send(draft)}
          />
          <Pressable style={styles.send} onPress={() => send(draft)}>
            <Ionicons name="arrow-up" size={20} color={colors.white} />
          </Pressable>
        </View>
        <Text style={styles.disclaimer}>iAI can make mistakes. Verify important information.</Text>
      </KeyboardAvoidingView>
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
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  brandSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  body: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  intro: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  introIcon: {
    width: 68,
    height: 68,
    borderRadius: radii.xl,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  introTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.text,
  },
  introSub: {
    fontSize: 13.5,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  capGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  capCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadow.soft,
  },
  capIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  capLabel: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
  },
  capDesc: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  suggTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  suggRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.soft,
  },
  suggText: {
    flex: 1,
    fontSize: 13.5,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    ...shadow.soft,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  textMine: {
    fontSize: 14.5,
    color: colors.white,
    lineHeight: 21,
  },
  textAi: {
    fontSize: 14.5,
    color: colors.text,
    lineHeight: 21,
  },
  aiActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 14.5,
    color: colors.text,
    ...shadow.soft,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    fontSize: 10.5,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
}));
