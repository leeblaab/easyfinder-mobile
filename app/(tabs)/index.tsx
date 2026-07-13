import React, { useState } from 'react';
import { SafeAreaView, View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { PopularServices } from '../../src/components/PopularServices';
import { WelcomeHeader } from '../../src/components/WelcomeHeader';
import { SearchBar } from '../../src/components/SearchBar';
import { CategoriesHorizontalScroll } from '../../src/components/CategoriesHorizontalScroll';
import { SubmitVendorCTA } from '../../src/components/SubmitVendorCTA'; // Add this import
import { useCategories } from '../../src/hooks/useCategories';

export default function HomeScreen() {
  const handleNavigateToCategory = (slug: string) => {
    router.push(`/category/${slug}`);
  };
  
  const [searchQuery, setSearchQuery] = useState('');
  const { data: categories } = useCategories();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <WelcomeHeader />
      
      {/* Search Bar */}
      <View className="px-4 pt-2 pb-4">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search services, categories, or locations..."
        />
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Categories Section - Horizontal Scroll */}
        {categories && categories.length > 0 && (
          <CategoriesHorizontalScroll categories={categories} />
        )}
        
        {/* Popular Services Section */}
        <PopularServices onNavigateToCategory={handleNavigateToCategory} />
        
        {/* Submit Vendor CTA */}
        <SubmitVendorCTA />
      </ScrollView>
    </SafeAreaView>
  );
}