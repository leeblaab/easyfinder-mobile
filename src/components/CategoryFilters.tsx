import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Filters {
  city?: string;
  verifiedOnly?: boolean;
}

interface CategoryFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const UAE_CITIES = [
  { name: 'Dubai', slug: 'dubai' },
  { name: 'Abu Dhabi', slug: 'abu-dhabi' },
  { name: 'Sharjah', slug: 'sharjah' },
  { name: 'Ajman', slug: 'ajman' },
  { name: 'Ras Al Khaimah', slug: 'ras-al-khaimah' },
  { name: 'Fujairah', slug: 'fujairah' },
  { name: 'Umm Al Quwain', slug: 'umm-al-quwain' },
  { name: 'Al Ain', slug: 'al-ain' },
];

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleCitySelect = (citySlug: string | undefined) => {
    Haptics.selectionAsync();
    onFiltersChange({ ...filters, city: citySlug });
  };

  const handleVerifiedToggle = () => {
    Haptics.selectionAsync();
    onFiltersChange({ ...filters, verifiedOnly: !filters.verifiedOnly });
  };

  const handleClearFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFiltersChange({});
  };

  const hasActiveFilters = filters.city || filters.verifiedOnly;

  return (
    <View className="bg-white border-b border-gray-100">
      {/* City Filter - Horizontal Scroll */}
      <View className="py-3">
        <View className="flex-row items-center mb-2 px-4">
          <MaterialCommunityIcons name="map-marker-outline" size={16} color="#6B7280" />
          <Text className="text-xs font-semibold text-gray-600 ml-1">Filter by City</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {/* All Cities Button */}
          <Pressable
            onPress={() => handleCitySelect(undefined)}
            className={`px-4 py-2 rounded-full border ${
              !filters.city
                ? 'bg-[#176B87] border-[#176B87]'
                : 'bg-white border-gray-200'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                !filters.city ? 'text-white' : 'text-gray-700'
              }`}
            >
              All Cities
            </Text>
          </Pressable>

          {/* City Buttons */}
          {UAE_CITIES.map((city) => (
            <Pressable
              key={city.slug}
              onPress={() => handleCitySelect(city.slug)}
              className={`px-4 py-2 rounded-full border ${
                filters.city === city.slug
                  ? 'bg-[#176B87] border-[#176B87]'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  filters.city === city.slug ? 'text-white' : 'text-gray-700'
                }`}
              >
                {city.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Verified Toggle & Clear Filters */}
      <View className="flex-row items-center justify-between px-4 pb-3">
        <Pressable
          onPress={handleVerifiedToggle}
          className={`flex-row items-center px-4 py-2 rounded-full border ${
            filters.verifiedOnly
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-white border-gray-200'
          }`}
        >
          <MaterialCommunityIcons
            name="check-decagram"
            size={16}
            color={filters.verifiedOnly ? '#059669' : '#6B7280'}
          />
          <Text
            className={`text-xs font-semibold ml-1.5 ${
              filters.verifiedOnly ? 'text-emerald-700' : 'text-gray-700'
            }`}
          >
            Verified Only
          </Text>
        </Pressable>

        {hasActiveFilters && (
          <Pressable
            onPress={handleClearFilters}
            className="flex-row items-center px-3 py-2"
          >
            <MaterialCommunityIcons name="close-circle-outline" size={16} color="#EF4444" />
            <Text className="text-xs font-semibold text-red-500 ml-1">Clear Filters</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};