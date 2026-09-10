import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme, colors as staticColors, radii, spacing } from '@/theme';

const FRAME_MARGIN = spacing.md;
const FRAME_RADIUS = radii.xl;
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';

/** Redirects between the auth stack and the app shell based on session state. */
function AuthGate({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === 'auth';
    if (!user && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments, router]);
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: staticColors.bg,
        }}
      >
        <ActivityIndicator color={staticColors.primary} />
      </View>
    );
  }
  return <>{children}</>;
}
function RootNavigator() {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.shell,
      }}
    >
      <StatusBar style="light" />
      <AuthGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colors.bg,
              marginTop: FRAME_MARGIN,
              borderTopLeftRadius: FRAME_RADIUS,
              borderTopRightRadius: FRAME_RADIUS,
              overflow: 'hidden',
            },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="timetable"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="exams"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="exam-seating"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="notices"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="documents"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="chamber/[id]"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="post/[id]"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="chat/[id]"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="clubs"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="reels"
            options={{
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="career"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="opportunity/[id]"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="portfolio"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="ai"
            options={{
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="ai-study"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="ai-search"
            options={{
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="auth/login"
            options={{
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="auth/verify"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="auth/forgot"
            options={{
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </AuthGate>
    </View>
  );
}
export default function RootLayout() {
  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
      }}
    >
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
