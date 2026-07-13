import React, { useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCategories } from '../hooks/useCategories';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Category {
  id: string | number;
  name: string;
  slug: string;
  vendorCount?: number;
}

interface PopularServicesProps {
  onNavigateToCategory: (slug: string) => void;
}

const PopularServiceCard: React.FC<{
  category: Category;
  onPress: () => void;
}> = ({ category, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
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

  const resolveCategoryIconName = (slug: string): string => {
    const iconMap: Record<string, string> = {
      'car-wash': 'car-wash',
      'ac-repair-maintenance': 'air-conditioner',
      'movers': 'truck-delivery',
      'photographers': 'camera',
      'painters': 'format-paint',
      'carpenters': 'hammer-screwdriver',
    };
    return iconMap[slug] || 'help-circle';
  };

  return (
    <Animated.View
      style={{ transform: [{ scale }] }}
      className="w-[48%] mb-4 bg-blue-50 rounded-xl p-4 items-center"
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="items-center"
        android_ripple={{ color: '#BBDEFB' }}
      >
        <MaterialCommunityIcons
          name={resolveCategoryIconName(category.slug) as any}
          size={28}
          color="#176B87"
        />
        <Text className="mt-3 text-center font-medium text-gray-800">
          {category.name}
        </Text>
        <Text className="text-xs text-gray-500 mt-1 text-center">
          {category.vendorCount ?? 0} providers
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export const PopularServices: React.FC<PopularServicesProps> = ({ onNavigateToCategory }) => {
  const { data: categories } = useCategories();

  const popularCategories = categories?.filter((category) =>
    ['car-wash', 'ac-repair-maintenance', 'movers', 'photographers', 'painters', 'carpenters'].includes(category.slug)
  );

  if (!popularCategories || popularCategories.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-4 px-4">
        <Text className="text-xl font-semibold text-gray-800">Popular Services</Text>
        <Pressable
          onPress={() => router.push('/(tabs)/categories')}
          className="flex-row items-center py-2 px-3 rounded-full bg-blue-50"
        >
          <Text className="text-blue-600 text-sm">View All</Text>
        </Pressable>
      </View>

      <View className="px-4">
        <View className="flex-row flex-wrap justify-between">
          {popularCategories.map((category) => (
            <PopularServiceCard
              key={category.id}
              category={category}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onNavigateToCategory(category.slug);
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
};