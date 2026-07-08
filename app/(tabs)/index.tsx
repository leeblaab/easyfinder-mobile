import React from 'react';
import { View, Text, ScrollView, FlatList, Pressable, StatusBar, RefreshControl, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useCategories } from '../../src/hooks/useCategories';
import { useFeaturedVendors } from '../../src/hooks/useFeaturedVendors';
import { usePullToRefresh } from '../../src/hooks/usePullToRefresh';
import { VendorCard } from '../../src/components/VendorCard';

const mapDirectusIconToMCI = (icon: string | undefined): any => {
  if (!icon) return 'help-circle';
  const iconLower = icon.toLowerCase().replace(/_/g, '-');
  const mapping: { [key: string]: string } = {
    'plumbing': 'wrench',
    'electrician': 'flash',
    'ac_repair': 'air-conditioner',
    'ac-repair': 'air-conditioner',
    'cleaning': 'broom',
    'movers': 'truck-delivery',
    'painting': 'format-paint',
    'painters': 'format-paint',
    'pest_control': 'bug',
    'pest-control': 'bug',
    'photography': 'camera',
    'repair': 'tools',
    'plumber': 'wrench',
    'electric': 'flash',
    'clean': 'broom',
    'move': 'truck',
    'paint': 'palette',
  };
  return mapping[iconLower] || iconLower || 'help-circle';
};

const VendorCardSkeleton = () => (
  <View className="flex-row bg-white p-4 rounded-xl border border-gray-100 mb-3 items-center">
    <View className="w-16 h-16 rounded-xl bg-gray-100" />
    <View className="flex-1 ml-4 justify-center">
      <View className="w-1/3 h-3 bg-gray-100 rounded" />
      <View className="w-3/4 h-4 bg-gray-100 rounded mt-2" />
      <View className="w-1/2 h-3 bg-gray-100 rounded mt-2" />
    </View>
  </View>
);

const CategorySkeleton = () => (
  <View className="items-center mr-6">
    <View className="w-14 h-14 bg-gray-100 rounded-full" />
    <View className="w-12 h-3 bg-gray-100 rounded mt-2" />
  </View>
);

const CategoryItem = ({ category, router }: { category: any; router: any }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/category/${category.slug}`);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }} className="items-center mr-6">
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handlePress}
        className="w-14 h-14 bg-[#EEF5FF] rounded-full items-center justify-center border border-[#176B87]/10 active:opacity-90"
      >
        <MaterialCommunityIcons
          name={mapDirectusIconToMCI(category.icon)}
          size={24}
          color="#176B87"
        />
      </Pressable>
      <Text className="text-gray-700 text-xs font-semibold mt-2 text-center" numberOfLines={1}>
        {category.name}
      </Text>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: categories, isLoading: isCategoriesLoading, isError: isCategoriesError, refetch: refetchCategories } = useCategories();
  const { data: featuredVendors, isLoading: isVendorsLoading, isError: isVendorsError, refetch: refetchVendors } = useFeaturedVendors();

  const { refreshing, onRefresh } = usePullToRefresh([refetchCategories, refetchVendors]);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#176B87" translucent />
      
      <FlatList
        data={featuredVendors}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <VendorCard vendor={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#176B87']}
            tintColor="#176B87"
          />
        }
        ListEmptyComponent={
          isVendorsLoading ? (
            <View className="px-4">
              <VendorCardSkeleton />
              <VendorCardSkeleton />
              <VendorCardSkeleton />
            </View>
          ) : (
            <View className="items-center justify-center py-10 px-4">
              <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-sm mt-2 font-medium text-center">
                {isVendorsError ? 'Failed to load featured providers' : 'No verified providers found'}
              </Text>
            </View>
          )
        }
        ListHeaderComponent={
          <View className="bg-white pb-3">
            {/* Header: welcoming greeting */}
            <LinearGradient
              colors={['#176B87', '#64B5F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingTop: insets.top + 16 }}
              className="px-5 pb-8 rounded-b-[32px] flex-row items-start justify-between shadow-md mb-4"
            >
              <View className="flex-1">
                <Text className="text-xs text-white/80 font-bold tracking-wider uppercase">
                  Welcome to EasyFinder
                </Text>
                <Text className="text-2xl font-extrabold text-white mt-1 leading-snug">
                  Find Trusted Services{'\n'}in the UAE
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/search');
                }}
                className="w-11 h-11 bg-white/20 border border-white/10 rounded-full items-center justify-center active:bg-white/30"
              >
                <MaterialCommunityIcons name="magnify" size={24} color="#ffffff" />
              </Pressable>
            </LinearGradient>

            {/* Categories Section */}
            <View className="py-2">
              <View className="px-5 flex-row items-center justify-between mb-3">
                <Text className="text-lg font-extrabold text-gray-900">
                  Browse Categories
                </Text>
              </View>

              {isCategoriesLoading ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                  <CategorySkeleton />
                  <CategorySkeleton />
                  <CategorySkeleton />
                  <CategorySkeleton />
                  <CategorySkeleton />
                </ScrollView>
              ) : isCategoriesError ? (
                <View className="px-5 py-2">
                  <Text className="text-xs text-red-500">Failed to load categories</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  {categories?.map((category) => (
                    <CategoryItem
                      key={category.id}
                      category={category}
                      router={router}
                    />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Featured Section Header */}
            <View className="px-5 pt-6 pb-2">
              <Text className="text-lg font-extrabold text-gray-900">
                Top Verified Providers
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5 font-medium">
                Vetted and recommended services near you
              </Text>
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        className="bg-gray-50"
      />
    </View>
  );
}
