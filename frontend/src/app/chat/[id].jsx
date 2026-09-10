import { useEffect, useRef, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radii, spacing, shadow, themedStyles } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { useApi } from '@/hooks/useApi';
import { usePolling } from '@/hooks/usePolling';
import { fetchThread, fetchMessages, sendMessage } from '@/lib/api/chat';
import { resolveAccent } from '@/lib/colorKey';
export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: thread } = useApi(() => fetchThread(id), [id]);
  const [messages, setMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);
  useEffect(() => {
    setMessages([]);
    setLoaded(false);
    fetchMessages(id).then((msgs) => {
      setMessages(msgs);
      setLoaded(true);
    });
  }, [id]);
  const pollForNew = () => {
    const lastId = messages[messages.length - 1]?.id;
    fetchMessages(id, lastId).then((fresh) => {
      if (fresh.length > 0) setMessages((prev) => [...prev, ...fresh]);
    });
  };
  usePolling(pollForNew, 4000, loaded);
  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    const message = await sendMessage(id, text);
    setMessages((m) => [...m, message]);
  };
  const themeColor = thread ? resolveAccent(thread.colorKey).color : colors.primary;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Avatar initials={thread?.initials ?? ''} size={40} color={themeColor} />
        <View
          style={{
            flex: 1,
          }}
        >
          <Text style={styles.name}>{thread?.name}</Text>
          <Text style={styles.status}>{thread?.isGroup ? `${thread.memberCount} members` : ''}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {!loaded ? (
          <ActivityIndicator
            color={colors.primary}
            style={{
              marginTop: spacing.xxl,
            }}
          />
        ) : (
          <ScrollView
            ref={scrollRef}
            style={{
              flex: 1,
            }}
            contentContainerStyle={styles.messages}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({
                animated: true,
              })
            }
          >
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} isGroup={!!thread?.isGroup} />
            ))}
          </ScrollView>
        )}

        {/* Composer */}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
            onSubmitEditing={send}
          />
          <Pressable style={styles.send} onPress={send}>
            <Ionicons name="send" size={20} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
function Bubble({ msg, isGroup }) {
  const senderColor = msg.senderColorKey ? resolveAccent(msg.senderColorKey).color : colors.primary;
  const time = new Date(msg.time).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  if (msg.mine) {
    return (
      <View
        style={[
          styles.row,
          {
            justifyContent: 'flex-end',
          },
        ]}
      >
        <View style={[styles.bubble, styles.bubbleMine]}>
          <Text style={styles.textMine}>{msg.text}</Text>
          <Text style={styles.timeMine}>{time}</Text>
        </View>
      </View>
    );
  }
  return (
    <View
      style={[
        styles.row,
        {
          justifyContent: 'flex-start',
        },
      ]}
    >
      <View style={[styles.bubble, styles.bubbleOther]}>
        {isGroup && msg.sender && (
          <Text
            style={[
              styles.sender,
              {
                color: senderColor,
              },
            ]}
          >
            {msg.sender}
          </Text>
        )}
        <Text style={styles.textOther}>{msg.text}</Text>
        <Text style={styles.timeOther}>{time}</Text>
      </View>
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
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  status: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  messages: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    ...shadow.soft,
  },
  sender: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  textMine: {
    fontSize: 14.5,
    color: colors.white,
    lineHeight: 20,
  },
  textOther: {
    fontSize: 14.5,
    color: colors.text,
    lineHeight: 20,
  },
  timeMine: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  timeOther: {
    fontSize: 10,
    color: colors.textMuted,
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14.5,
    color: colors.text,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
