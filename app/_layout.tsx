import * as Sentry from '@sentry/react-native';
import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/stores/useAuthStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import ErrorScreen from '../src/components/ErrorScreen';
import { handleDeepLink } from '../src/utils/deepLinking';

// Initialize Sentry for Error Tracking and Crash Reporting
Sentry.init({
  dsn: 'YOUR_SENTRY_DSN_HERE', // User will replace this with their actual Sentry DSN key later
  enableInExpoDevelopment: true,
  debug: __DEV__, // Enabled debugging only in development mode
});

// Initialize the TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { isLoading, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();

    // Listen to deep linking events
    const handleDeepLinkEvent = (event: { url: string }) => {
      handleDeepLink(event.url, router);
    };

    // Parse initial URL if app was opened via deep link on cold launch
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url, router);
      }
    });

    const subscription = Linking.addEventListener('url', handleDeepLinkEvent);

    return () => {
      subscription.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <View className="w-20 h-20 bg-[#EEF5FF] rounded-3xl items-center justify-center border border-[#176B87]/10 mb-4">
          <MaterialCommunityIcons name="magnify-expand" size={40} color="#176B87" />
        </View>
        <Text className="text-gray-900 font-extrabold text-xl tracking-wide">
          EasyFinder UAE
        </Text>
        <Text className="text-gray-400 text-xs mt-1 font-medium">
          Loading trusted UAE services...
        </Text>
        <ActivityIndicator size="small" color="#176B87" className="mt-6" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="search" options={{ animation: 'fade' }} />
      <Stack.Screen name="category/[slug]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="vendor/[slug]" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="auth/login" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="auth/register" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="submit" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="legal/privacy" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="legal/terms" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

function RootLayout() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorScreen />}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

// Wrap the root layout in Sentry.wrap() to capture performance traces and autolink errors
export default Sentry.wrap(RootLayout);
