import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadow, themedStyles } from '@/theme';
import { useApi } from '@/hooks/useApi';
import { usePolling } from '@/hooks/usePolling';
import { fetchThreads } from '@/lib/api/chat';

/** Minimal shape of the props a tabBar receives — decoupled from the
 *  navigation package version to avoid cross-package type conflicts. */

const ICONS = {
  index: {
    on: 'home',
    off: 'home-outline',
    label: 'Home',
  },
  community: {
    on: 'people',
    off: 'people-outline',
    label: 'Community',
  },
  create: {
    on: 'add',
    off: 'add',
    label: 'Create',
  },
  messages: {
    on: 'chatbubble',
    off: 'chatbubble-outline',
    label: 'Messages',
  },
  profile: {
    on: 'person',
    off: 'person-outline',
    label: 'Profile',
  },
};

/** Custom bottom tab bar with a floating center "+" action (matches mockups). */
export function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { data: threads, refetch } = useApi(fetchThreads);
  usePolling(refetch, 15000);
  const unreadMessages = (threads ?? []).reduce((sum, t) => sum + t.unread, 0);
  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const meta = ICONS[route.name];
        if (!meta) return null;
        const focused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        // Center create button
        if (route.name === 'create') {
          return (
            <Pressable key={route.key} style={styles.fabWrap} onPress={onPress}>
              <View style={styles.fab}>
                <Ionicons name="add" size={30} color={colors.primary} />
              </View>
            </Pressable>
          );
        }
        const color = focused ? colors.white : 'rgba(255,255,255,0.6)';
        const badge = route.name === 'messages' && unreadMessages > 0 ? unreadMessages : undefined;
        return (
          <Pressable key={route.key} style={styles.tab} onPress={onPress}>
            <View>
              <Ionicons name={focused ? meta.on : meta.off} size={23} color={color} />
              {badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[
                styles.label,
                {
                  color,
                },
              ]}
            >
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
const styles = themedStyles((colors) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingTop: 12,
    paddingHorizontal: 8,
    ...shadow.card,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: -4,
    },
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  fabWrap: {
    flex: 1,
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    borderWidth: 3,
    borderColor: colors.primary,
    ...shadow.card,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.4,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: colors.red,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
}));
