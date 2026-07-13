import React, { ComponentProps } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category } from '../types';
import { resolveCategoryIconName } from '../utils/categoryIcon';
import * as Haptics from 'expo-haptics';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface CategorySearchResultProps {
  category: Category;
  onPress: () => void;
}

export const CategorySearchResult: React.FC<CategorySearchResultProps> = ({
  category,
  onPress,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center bg-white p-4 rounded-xl border border-gray-100 mb-3"
    >
      <View className="w-12 h-12 bg-[#EEF5FF] rounded-xl items-center justify-center border border-[#176B87]/10">
        <MaterialCommunityIcons
          name={resolveCategoryIconName(category.icon) as IconName}
          size={24}
          color="#176B87"
        />
      </View>
      <View className="ml-4 flex-1">
        <Text className="font-bold text-gray-900">{category.name}</Text>
        <Text className="text-xs text-gray-500 capitalize">Category</Text>
        {category.description && (
          <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>
            {category.description}
          </Text>
        )}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
    </Pressable>
  );
};