import React, { useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export const SubmitVendorCTA: React.FC = () => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/submit');
  };

  return (
    <View className="px-4 mb-6">
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <LinearGradient
            colors={['#176B87', '#64B5F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-5 shadow-lg"
          >
            <View className="flex-row items-center">
              <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center border border-white/10 mr-4">
                <MaterialCommunityIcons name="store-plus" size={28} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-extrabold text-base">
                  List Your Business
                </Text>
                <Text className="text-white/90 text-xs mt-1 leading-snug">
                  Grow your customer base with EasyFinder UAE
                </Text>
              </View>
              <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/10">
                <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" />
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
};