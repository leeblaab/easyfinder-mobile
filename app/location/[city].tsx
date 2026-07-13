import React from 'react';
import { View, Text, ScrollView, FlatList, StatusBar, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useVendorsByLocation } from '../../src/hooks/useVendorsByLocation';
import { usePullToRefresh } from '../../src/hooks/usePullToRefresh';
import { VendorCard } from '../../src/components/VendorCard';
import { Vendor } from '../../src/types';

export default function LocationDetailScreen() {
  const { city } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: vendors, isLoading, isError, refetch } = useVendorsByLocation(city as string);
  const { refreshing, onRefresh } = usePullToRefresh([refetch]);

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#176B87" translucent />

      {/* Header */}
      <LinearGradient
        colors={['#176B87', '#64B5F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16 }}
        className="px-5 pb-6 rounded-b-[32px] shadow-md"
      >
        <View className="flex-row items-center">
          <Text className="text-2xl font-extrabold text-white">
            {capitalizeFirstLetter(city as string)}
          </Text>
        </View>
        <Text className="text-white/80 text-sm mt-1">
          {vendors?.length || 0} service providers
        </Text>
      </LinearGradient>

      {/* Content */}
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
        ListEmptyComponent={
          isLoading ? (
            <View className="px-4 mt-4">
              <View className="flex-row bg-white p-4 rounded-xl border border-gray-100 mb-3 items-center">
                <View className="w-16 h-16 rounded-xl bg-gray-100" />
                <View className="flex-1 ml-4 justify-center">
                  <View className="w-1/3 h-3 bg-gray-100 rounded" />
                  <View className="w-3/4 h-4 bg-gray-100 rounded mt-2" />
                  <View className="w-1/2 h-3 bg-gray-100 rounded mt-2" />
                </View>
              </View>
              <View className="flex-row bg-white p-4 rounded-xl border border-gray-100 mb-3 items-center">
                <View className="w-16 h-16 rounded-xl bg-gray-100" />
                <View className="flex-1 ml-4 justify-center">
                  <View className="w-1/3 h-3 bg-gray-100 rounded" />
                  <View className="w-3/4 h-4 bg-gray-100 rounded mt-2" />
                  <View className="w-1/2 h-3 bg-gray-100 rounded mt-2" />
                </View>
              </View>
              <View className="flex-row bg-white p-4 rounded-xl border border-gray-100 mb-3 items-center">
                <View className="w-16 h-16 rounded-xl bg-gray-100" />
                <View className="flex-1 ml-4 justify-center">
                  <View className="w-1/3 h-3 bg-gray-100 rounded" />
                  <View className="w-3/4 h-4 bg-gray-100 rounded mt-2" />
                  <View className="w-1/2 h-3 bg-gray-100 rounded mt-2" />
                </View>
              </View>
            </View>
          ) : isError ? (
            <View className="items-center justify-center py-10 px-4">
              <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-sm mt-2 font-medium text-center">
                Failed to load providers in {capitalizeFirstLetter(city as string)}
              </Text>
            </View>
          ) : (
            <View className="items-center justify-center py-10 px-4">
              <MaterialCommunityIcons name="map-marker-off" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-sm mt-2 font-medium text-center">
                No providers found in {capitalizeFirstLetter(city as string)}
              </Text>
            </View>
          )
        }
        contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingTop: 16, 
          paddingBottom: insets.bottom + 16 
        }}
      />
    </View>
  );
}