import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface LocationSelectorProps {
  locations: Array<{
    name: string;
    count: number;
    icon: string;
  }>;
  onLocationSelect: (location: string) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  locations,
  onLocationSelect,
}) => {
  return (
    <View className="mt-4">
      <Text className="text-lg font-extrabold text-gray-900 mb-3">
        Find Services Near You
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 16, gap: 12 }}
      >
        {locations.map((location, index) => (
          <LocationCard 
            key={index} 
            location={location} 
            onSelect={onLocationSelect} 
          />
        ))}
      </ScrollView>
    </View>
  );
};

interface LocationCardProps {
  location: {
    name: string;
    count: number;
    icon: string;
  };
  onSelect: (location: string) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, onSelect }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 20, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  const handleSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(location.name);
  };

  return (
    <Animated.View 
      style={{ transform: [{ scale }] }}
      className="w-24 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleSelect}
        className="h-full items-center justify-center p-3"
      >
        <MaterialCommunityIcons 
          name={location.icon as any} // Type assertion since we know the icon name is valid
          size={24} 
          color="#176B87" 
        />
        <Text className="text-xs font-bold text-gray-900 mt-1 text-center">
          {location.name}
        </Text>
        <Text className="text-xs text-gray-500 mt-1 text-center">
          {location.count.toLocaleString()} providers
        </Text>
      </Pressable>
    </Animated.View>
  );
};