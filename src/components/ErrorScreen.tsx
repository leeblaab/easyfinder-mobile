import React from 'react';
import { View, Text, Pressable, DevSettings, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function ErrorScreen() {
  const router = useRouter();

  const handleReload = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    // In development mode, trigger hot reloading/refresh
    if (__DEV__) {
      if (DevSettings?.reload) {
        DevSettings.reload();
        return;
      }
    }
    
    // Fallback: reset navigation tree to home screen
    try {
      router.replace('/(tabs)');
    } catch (e) {
      // absolute safe fallback
      console.log('App navigation reset fallback');
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <View className="w-20 h-20 bg-red-50 rounded-3xl items-center justify-center border border-red-100 mb-6 shadow-sm">
        <MaterialCommunityIcons name="alert-octagon-outline" size={44} color="#EF4444" />
      </View>
      
      <Text className="text-gray-950 font-extrabold text-2xl tracking-wide text-center">
        Something Went Wrong
      </Text>
      
      <Text className="text-gray-400 text-sm mt-2 text-center leading-relaxed max-w-xs">
        EasyFinder UAE encountered an unexpected crash. We've logged this diagnostic data to our engineers.
      </Text>
      
      <Pressable
        onPress={handleReload}
        className="mt-8 bg-[#176B87] px-8 py-3.5 rounded-xl flex-row items-center justify-center shadow-md active:opacity-90 w-full max-w-xs"
      >
        <MaterialCommunityIcons name="refresh" size={20} color="#ffffff" className="mr-2" />
        <Text className="text-white font-extrabold text-sm ml-1.5">Reload App</Text>
      </Pressable>
    </View>
  );
}
