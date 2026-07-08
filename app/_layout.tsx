import '../global.css';
import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/stores/useAuthStore';
import * as Linking from 'expo-linking';
import ErrorScreen from '../src/components/ErrorScreen';
import { handleDeepLink } from '../src/utils/deepLinking';

// Initialize the TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  loadingSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 24,
    fontWeight: '500',
  },
});

function AppContent() {
  const { isLoading, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Call hydrate but with a safety timeout to prevent hanging
    const hydrateWithTimeout = async () => {
      try {
        await Promise.race([
          hydrate(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Hydration timeout')), 5000)
          ),
        ]);
      } catch (error) {
        console.warn('Hydration error or timeout:', error);
        // Force loading to end even if hydration fails
        useAuthStore.setState({ isLoading: false });
      }
    };

    hydrateWithTimeout();

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
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>EasyFinder UAE</Text>
        <Text style={styles.loadingSubtitle}>Loading trusted UAE services...</Text>
        <ActivityIndicator size="large" color="#176B87" />
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
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default RootLayout;
