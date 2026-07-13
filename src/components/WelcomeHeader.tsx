import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const WelcomeHeader: React.FC = () => {
  return (
    <LinearGradient
      colors={['#176B87', '#64B5F6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="p-6"
    >
      <View className="mt-4">
        <Text className="text-white text-xl font-bold">WELCOME TO EASYFINDER</Text>
        <Text className="text-white text-lg mt-1">Find Trusted Services</Text>
        <Text className="text-white text-lg">in the UAE</Text>
      </View>
    </LinearGradient>
  );
};