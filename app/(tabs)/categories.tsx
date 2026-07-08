import React from 'react';
import { View, Text, FlatList, Pressable, StatusBar, ActivityIndicator, RefreshControl, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useCategories } from '../../src/hooks/useCategories';
import { usePullToRefresh } from '../../src/hooks/usePullToRefresh';
import { Category } from '../../src/types';

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

const CategoryGridItem = ({ item, onPress }: { item: Category; onPress: () => void }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }} className="flex-1 m-2">
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        className="flex-1 bg-white p-5 rounded-2xl items-center justify-center border border-gray-100 shadow-sm active:opacity-90"
      >
        <View className="w-14 h-14 bg-[#EEF5FF] rounded-full items-center justify-center mb-3 border border-[#176B87]/10">
          <MaterialCommunityIcons
            name={mapDirectusIconToMCI(item.icon)}
            size={28}
            color="#176B87"
          />
        </View>
        <Text className="text-gray-900 text-sm font-bold text-center" numberOfLines={1}>
          {item.name}
        </Text>
        {item.description ? (
          <Text className="text-gray-400 text-[11px] text-center mt-1 leading-snug" numberOfLines={2}>
            {item.description}
          </Text>
        ) : (
          <Text className="text-gray-400 text-[11px] text-center mt-1">
            Explore providers
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default function CategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: categories, isLoading, isError, refetch } = useCategories();

  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const handleCategoryPress = (category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/category/${category.slug}`);
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
        className="px-5 pb-8 rounded-b-[32px] shadow-md"
      >
        <Text className="text-xs text-white/80 font-bold tracking-wider uppercase">
          EasyFinder UAE
        </Text>
        <Text className="text-3xl font-extrabold text-white mt-1">
          All Categories
        </Text>
        <Text className="text-xs text-white/90 mt-2 leading-normal">
          Choose a category to find specialized, vetted local service providers
        </Text>
      </LinearGradient>

      {isLoading ? (
        <View className="flex-1 items-center justify-center bg-gray-50">
          <ActivityIndicator size="large" color="#176B87" />
          <Text className="text-gray-500 text-sm mt-3 font-medium">Loading categories...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-4 bg-gray-50">
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-red-500 font-bold mt-2 text-center text-base">Failed to load categories</Text>
          <Text className="text-gray-400 text-sm text-center mt-1">Please try again later</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CategoryGridItem
              item={item}
              onPress={() => handleCategoryPress(item)}
            />
          )}
          numColumns={2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#176B87']}
              tintColor="#176B87"
            />
          }
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 16, paddingBottom: insets.bottom + 20 }}
          className="bg-gray-50"
        />
      )}
    </View>
  );
}
