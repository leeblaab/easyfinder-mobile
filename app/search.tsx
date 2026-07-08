import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSearchVendors } from '../src/hooks/useSearchVendors';
import { usePullToRefresh } from '../src/hooks/usePullToRefresh';
import { VendorCard } from '../src/components/VendorCard';
import { sanitizeSearchQuery } from '../src/utils/inputSanitizer';
import { Vendor } from '../src/types';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const { data: vendors, isLoading, isError, refetch } = useSearchVendors(sanitizeSearchQuery(query));
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const handleClear = () => {
    setQuery('');
  };

  const renderContent = () => {
    if (query.trim().length < 2) {
      return (
        <View className="flex-1 items-center justify-center p-6 bg-gray-50">
          <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
            <MaterialCommunityIcons name="magnify" size={32} color="#9CA3AF" />
          </View>
          <Text className="text-gray-800 font-bold text-base text-center">
            Start typing to search
          </Text>
          <Text className="text-gray-400 text-xs text-center mt-1 leading-relaxed">
            Enter at least 2 characters to search for local service providers, companies, or individual professionals.
          </Text>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center bg-gray-50">
          <ActivityIndicator size="large" color="#176B87" />
          <Text className="text-gray-500 text-sm mt-3 font-medium">Searching providers...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View className="flex-1 items-center justify-center p-6 bg-gray-50">
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-red-500 font-bold mt-2 text-center text-base">
            Search failed
          </Text>
          <Text className="text-gray-400 text-xs text-center mt-1">
            An error occurred while fetching search results. Please try again.
          </Text>
        </View>
      );
    }

    if (!vendors || vendors.length === 0) {
      return (
        <View className="flex-1 items-center justify-center p-6 bg-gray-50">
          <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4">
            <MaterialCommunityIcons name="cloud-search-outline" size={32} color="#EF4444" />
          </View>
          <Text className="text-gray-800 font-bold text-base text-center">
            No results found
          </Text>
          <Text className="text-gray-400 text-xs text-center mt-1 leading-relaxed">
            We couldn't find any service provider matching "{query}". Try checking your spelling or search for different terms.
          </Text>
        </View>
      );
    }

    return (
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
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#176B87" translucent />

      {/* Header bar with Search Input */}
      <LinearGradient
        colors={['#176B87', '#64B5F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 12 }}
        className="px-4 pb-4 shadow-md flex-row items-center"
      >
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/10 active:bg-white/30 mr-3"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </Pressable>

        <View className="flex-1 flex-row items-center bg-white rounded-xl px-3 py-1.5 shadow-sm">
          <MaterialCommunityIcons name="magnify" size={20} color="#176B87" />
          <TextInput
            placeholder="Search providers (e.g. plumber, Movers...)"
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (text.length > 0 && text.length % 3 === 0) {
                Haptics.selectionAsync();
              }
            }}
            className="flex-1 ml-2 text-gray-800 text-sm font-semibold py-1.5"
            autoFocus
            clearButtonMode="never"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleClear();
              }}
              className="p-1 active:opacity-75"
            >
              <MaterialCommunityIcons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </LinearGradient>

      {/* Main Content Area */}
      {renderContent()}
    </View>
  );
}
