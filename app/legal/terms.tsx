import React from 'react';
import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function TermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white">
        <Pressable
          onPress={handleBack}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-3 active:bg-gray-100"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-gray-950 font-extrabold text-lg">Terms of Service</Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingVertical: 20, paddingBottom: 50 }}>
        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Last Updated: July 8, 2026</Text>
        <Text className="text-gray-900 font-extrabold text-2xl mb-5">EasyFinder UAE Terms of Service</Text>

        <Text className="text-gray-600 text-sm leading-relaxed mb-6">
          Welcome to EasyFinder UAE. By downloading, accessing, or using our mobile application, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
        </Text>

        <View className="space-y-6">
          {/* Section 1 */}
          <View>
            <Text className="text-gray-950 font-extrabold text-base mb-2">1. Use of the App</Text>
            <Text className="text-gray-600 text-sm leading-relaxed mb-2">
              EasyFinder UAE is a directory app helping users find registered local service providers. You must use the service only for lawful purposes, and you are responsible for maintaining the confidentiality of your account credentials.
            </Text>
          </View>

          {/* Section 2 */}
          <View>
            <Text className="text-gray-950 font-extrabold text-base mb-2">2. User-Generated Content (UGC) Guidelines</Text>
            <Text className="text-gray-600 text-sm leading-relaxed mb-2">
              You may submit reviews, comments, ratings, and business listings. By publishing content on EasyFinder UAE, you agree that:
            </Text>
            <Text className="text-gray-600 text-sm leading-relaxed ml-3 mb-1">• Your submissions are accurate, truthful, and reflective of your real experience.</Text>
            <Text className="text-gray-600 text-sm leading-relaxed ml-3 mb-1">• You will not post content that is spam, fraudulent, defamatory, harassing, obscene, or racially offensive.</Text>
            <Text className="text-gray-600 text-sm leading-relaxed ml-3 mb-1">• We maintain a zero-tolerance policy for abusive UGC. Any reported content will be reviewed, and violators may face permanent account suspension.</Text>
          </View>

          {/* Section 3 */}
          <View>
            <Text className="text-gray-950 font-extrabold text-base mb-2">3. Accuracy of Listing Data</Text>
            <Text className="text-gray-600 text-sm leading-relaxed mb-2">
              While we strive to verify all submissions, we do not guarantee the completeness or accuracy of third-party vendor directories, contact information, hours, or licensing status. Users must exercise their own discretion when hiring or scheduling services.
            </Text>
          </View>

          {/* Section 4 */}
          <View>
            <Text className="text-gray-950 font-extrabold text-base mb-2">4. Intellectual Property</Text>
            <Text className="text-gray-600 text-sm leading-relaxed mb-2">
              All branding, application assets, designs, logo files, and proprietary features are the exclusive property of EasyFinder UAE. Unauthorized reproduction, distribution, or modification of these assets is strictly prohibited.
            </Text>
          </View>

          {/* Section 5 */}
          <View>
            <Text className="text-gray-950 font-extrabold text-base mb-2">5. Governing Law</Text>
            <Text className="text-gray-600 text-sm leading-relaxed mb-2">
              These Terms of Service are governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the UAE courts.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
