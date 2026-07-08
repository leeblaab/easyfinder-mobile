import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useVendorsByCategory } from '../../src/hooks/useVendorsByCategory';
import { useCategories } from '../../src/hooks/useCategories';
import { usePullToRefresh } from '../../src/hooks/usePullToRefresh';
import { VendorCard } from '../../src/components/VendorCard';
import { Vendor } from '../../src/types';
import { resolveCategoryIconName } from '../../src/utils/categoryIcon';

export default function CategoryDetailScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: vendors, isLoading: isVendorsLoading, isError: isVendorsError, refetch } = useVendorsByCategory(slug as string);
  const { data: categories } = useCategories();

  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  // Find category detail for the header
  const category = categories?.find((c) => c.slug === slug);
  const categoryName = category?.name || (slug ? (slug as string).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Category');

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#176B87" translucent />

      {/* Header Bar */}
      <LinearGradient
        colors={['#176B87', '#64B5F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pb-4 shadow-md"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/10 active:bg-white/30"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          </Pressable>
          <Text className="text-white font-extrabold text-lg ml-4 flex-1" numberOfLines={1}>
            {categoryName}
          </Text>
        </View>
      </LinearGradient>

      {/* Category Info Header block */}
      <View className="bg-white px-5 py-6 border-b border-gray-100 flex-row items-center shadow-sm">
        <View className="w-14 h-14 bg-[#EEF5FF] rounded-2xl items-center justify-center border border-[#176B87]/10 mr-4">
          <MaterialCommunityIcons
            name={resolveCategoryIconName(category?.icon)}
            size={28}
            color="#176B87"
          />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-extrabold text-lg leading-tight">
            {categoryName}
          </Text>
          <Text className="text-gray-500 text-xs mt-1 leading-snug">
            {category?.description || 'Browse highly recommended and verified local businesses and experts.'}
          </Text>
        </View>
      </View>

      {/* Vendors list area */}
      {isVendorsLoading ? (
        <View className="flex-1 items-center justify-center bg-gray-50">
          <ActivityIndicator size="large" color="#176B87" />
          <Text className="text-gray-500 text-sm mt-3 font-medium">Loading providers...</Text>
        </View>
      ) : isVendorsError ? (
        <View className="flex-1 items-center justify-center px-4 bg-gray-50">
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-red-500 font-bold mt-2 text-center text-base">Failed to load providers</Text>
          <Text className="text-gray-400 text-sm text-center mt-1">Please try again later</Text>
        </View>
      ) : !vendors || vendors.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6 bg-gray-50">
          <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
            <MaterialCommunityIcons name="account-search-outline" size={32} color="#9CA3AF" />
          </View>
          <Text className="text-gray-800 font-bold text-base text-center">No service providers available</Text>
          <Text className="text-gray-400 text-xs text-center mt-1.5 leading-relaxed">
            There are currently no listed providers for the {categoryName} category. We are continuously adding trusted new businesses.
          </Text>
        </View>
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(item: Vendor) => item.id.toString()}
          renderItem={({ item }: { item: Vendor }) => <VendorCard vendor={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#176B87']}
              tintColor="#176B87"
            />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: insets.bottom + 20 }}
          className="bg-gray-50"
        />
      )}
    </View>
  );
}
