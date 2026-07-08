import React, { useRef } from 'react';
import { Pressable, View, Text, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Vendor } from '../types';
import { apiClient } from '../services/api-client';

interface VendorCardProps {
  vendor: Vendor;
}

export const VendorCard: React.FC<VendorCardProps> = ({ vendor }) => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const logoUrl = vendor.logo
    ? (vendor.logo.startsWith('http')
        ? vendor.logo
        : `${apiClient.defaults.baseURL}/assets/${vendor.logo}`)
    : null;

  const serviceAreasString = Array.isArray(vendor.service_areas)
    ? vendor.service_areas.join(', ')
    : vendor.service_areas || '';

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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
    router.push(`/vendor/${vendor.slug}`);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handlePress}
        className="flex-row bg-white p-4 rounded-xl border border-gray-100 mb-3 items-center active:opacity-90"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
        testID={`vendor_card_${vendor.id}`}
      >
        {/* Left side: Logo or Fallback Avatar */}
        {logoUrl ? (
          <Image
            source={{ uri: logoUrl }}
            className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100"
            resizeMode="cover"
          />
        ) : (
          <View className="w-16 h-16 rounded-xl bg-sky-50 items-center justify-center border border-sky-100">
            <Text className="text-sky-800 text-2xl font-bold">
              {vendor.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Right side: Vendor details */}
        <View className="flex-1 ml-4 justify-center">
          <View className="flex-row items-center flex-wrap">
            <Text className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">
              {vendor.category?.name || 'Service Provider'}
            </Text>

            {vendor.verified && (
              <View className="ml-2 flex-row items-center bg-teal-50 px-1.5 py-0.5 rounded-full border border-teal-100">
                <MaterialCommunityIcons name="check-decagram" size={11} color="#176B87" />
                <Text className="text-[9px] text-[#176B87] font-bold ml-0.5">Verified</Text>
              </View>
            )}
          </View>

          <Text className="text-gray-900 text-base font-bold mt-1 leading-tight">
            {vendor.name}
          </Text>

          {serviceAreasString ? (
            <View className="flex-row items-center mt-1.5">
              <MaterialCommunityIcons name="map-marker-outline" size={13} color="#9CA3AF" />
              <Text className="text-gray-500 text-xs ml-0.5" numberOfLines={1}>
                {serviceAreasString}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Right chevron indicator */}
        <View className="ml-2">
          <MaterialCommunityIcons name="chevron-right" size={20} color="#D1D5DB" />
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default VendorCard;
