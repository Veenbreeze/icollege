import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '@/theme';

function RootNavigator() {
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="timetable" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="exams" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="exam-seating" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="notices" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="documents" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="chamber/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="post/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="chat/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="clubs" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="reels" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="career" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="opportunity/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="portfolio" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ai" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="ai-study" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ai-search" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="auth/login" options={{ animation: 'fade' }} />
        <Stack.Screen name="auth/register" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="auth/verify" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="auth/forgot" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
