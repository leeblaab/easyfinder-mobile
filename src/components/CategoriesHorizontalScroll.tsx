import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { resolveCategoryIconName } from '../utils/categoryIcon'; // Assuming you have this utility

interface Category {
  id: string | number;
  name: string;
  slug: string;
  icon?: string;
}

interface CategoriesHorizontalScrollProps {
  categories: Category[];
}

export const CategoriesHorizontalScroll: React.FC<CategoriesHorizontalScrollProps> = ({ categories }) => {
  const handleCategoryPress = (categorySlug: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/category/${categorySlug}`);
  };

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-4 px-4">
        <Text className="text-xl font-bold text-gray-900">Browse Categories</Text>
        <Pressable 
          onPress={() => router.push('/(tabs)/categories')}
          className="flex-row items-center py-2 px-3 rounded-full bg-blue-50"
        >
          <Text className="text-blue-600 text-sm font-semibold">View All</Text>
        </Pressable>
      </View>
      
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
      >
        {categories.map((category) => (
          <Pressable 
            key={category.id} 
            onPress={() => handleCategoryPress(category.slug)}
            className="items-center w-20"
          >
            <View className="w-16 h-16 bg-[#EEF5FF] rounded-full items-center justify-center border border-[#176B87]/10 mb-2">
              <MaterialCommunityIcons
                name={resolveCategoryIconName(category.icon) as any}
                size={28}
                color="#176B87"
              />
            </View>
            <Text className="text-gray-700 text-xs font-bold text-center" numberOfLines={1}>
              {category.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};