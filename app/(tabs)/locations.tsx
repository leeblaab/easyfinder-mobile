import React from 'react';
import { View, Text, ScrollView, Pressable, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocationVendorCounts } from '../../src/hooks/useLocationVendorCounts';

export default function LocationsScreen() {
  const { data: locations, isLoading, isError } = useLocationVendorCounts();
  
  const scale = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true
    }).start();
  };
  
  const handleLocationPress = (locationSlug: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/location/${locationSlug}`);
  };
  
  const resolveLocationIconName = (slug: string): string => {
  if (slug === 'dubai') return 'city-variant';
  if (slug === 'abu-dhabi') return 'bank';           // Changed from 'landmark'
  if (slug === 'sharjah') return 'castle';
  if (slug === 'ajman') return 'home-city';
  if (slug === 'ras-al-khaimah') return 'image-filter-hdr';  // Changed from 'mountain'
  if (slug === 'fujairah') return 'beach';
  if (slug === 'umm-al-quwain') return 'island';
  if (slug === 'al-ain') return 'palm-tree';
  return 'map-marker-radius';
};

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#176B87" />
        <Text style={styles.loadingText}>Loading locations...</Text>
      </View>
    );
  }

  if (isError || !locations) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load locations</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#64B5F6', '#176B87']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Explore by Location</Text>
        <Text style={styles.headerSubtitle}>Find service providers across the UAE</Text>
      </LinearGradient>
      
      {/* Location Grid */}
      <View style={styles.gridContainer}>
        {locations.map((location) => (
          <Animated.View 
            key={location.slug}
            style={[styles.cardContainer, { transform: [{ scale }] }]}
          >
            <Pressable 
              onPress={() => handleLocationPress(location.slug)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              android_ripple={{ color: '#BBDEFB' }}
              style={styles.pressable}
            >
              <MaterialCommunityIcons 
                name={resolveLocationIconName(location.slug) as any}
                size={32} 
                color="#176B87" 
              />
              <Text style={styles.locationName}>{location.name}</Text>
              <Text style={styles.vendorCount}>
                {location.vendorCount.toLocaleString()} providers
              </Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#EF4444',
  },
  headerGradient: {
    padding: 20,
    paddingTop: 60,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardContainer: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#EEF5FF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  pressable: {
    alignItems: 'center',
    padding: 20,
  },
  locationName: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#176B87',
    textAlign: 'center',
  },
  vendorCount: {
    marginTop: 6,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
});