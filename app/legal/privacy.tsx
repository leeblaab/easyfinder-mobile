import React from 'react';
import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function PrivacyScreen() {
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
        <Text className="text-gray-950 font-extrabold text-lg">Privacy Policy</Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingVertical: 20, paddingBottom: 50 }}>
        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Effective Date: July 8, 2026</Text>
        <Text className="text-gray-900 font-extrabold text-2xl mb-5">EasyFinder UAE Privacy Policy</Text>

        <Text className="text-gray-600 text-sm leading-relaxed mb-6">
          EasyFinder UAE ("we", "our", or "us") operates the EasyFinder UAE mobile directory application. We are committed to protecting your privacy and ensuring a secure experience while discovering services in the United Arab Emirates.
        </Text>

        <View className="space-y-6">
          {/* Section 1 */}
          <View>
            <Text className="text-gray-950 font-extrabold text-base mb-2">1. Information We Collect</Text>
            <Text className="text-gray-600 text-sm leading-relaxed mb-2">
              We collect information to provide a better, more personalized directory experience. This includes:
            </Text>
            <Text className="text-gray-600 text-sm leading-relaxed ml-3 mb-1">• <Text className="font-bold text-gray-800">Account Details:</Text> Email, name, and profile credentials when you register.</Text>
            <Text className="text-gray-600 text-sm leading-relaxed ml-3 mb-1">• <Text className="font-bold text-gray-800">User Content:</Text> Reviews, ratings, images, and service submissions you provide.</Text>
            <Text className="text-gray-600 text-sm leading-relaxed ml-3 mb-1">• <Text className="font-bold text-gray-800">Usage Data:</Text> Log data, device information, IP address, and application telemetry.</Text>
          </View>

          {/* Section 2 */}
          <View>
            <Text className="text-gray-950 font-extrabold text-base mb-2">2. How We Use Information</Text>
            <Text className="text-gray-600 text-sm leading-relaxed mb-2">
              The information we gather is used to:
            </Text>
            <Text className="text-gray-600 text-sm leading-relaxed ml-3 mb-1">• Maintain, verify, and improve our local services directory.</Text>
            <Text className="text-gray-600 text-sm leading-relaxed ml-3 mb-1">• Review and moderate community-submitted reviews (UGC compliance).</Text>
            <Text className="text-gray-600 text-sm leading-relaxed ml-3 mb-1">• Authenticate users and prevent fraud or malicious activities.</Text>
          </View>

          {/* Section 3 */}
          <View>
            <Text className="text-gray-950 font-extrabold text-base mb-2">3. Data Security and UAE Compliance</Text>
            <Text className="text-gray-600 text-sm leading-relaxed mb-2">
              Your personal details are stored using highly secure mechanisms such as encrypted local stores (SecureStore) and industry-standard security protocols. In accordance with the UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection (PDPL), we ensure strict administrative controls over access to database instances.
            </Text>
          </View>

          {/* Section 4 */}
          <View>
            <Text className="text-gray-950 font-extrabold text-base mb-2">4. User Content Moderation (UGC)</Text>
            <Text className="text-gray-600 text-sm leading-relaxed mb-2">
              To keep EasyFinder a helpful and positive platform, we strictly moderate reviews, ratings, and business submissions. Any user may report content that violates our standards. We reserve the right to remove any content deemed offensive, spam, fake, or harmful.
            </Text>
          </View>

          {/* Section 5 */}
          <View>
            <Text className="text-gray-950 font-extrabold text-base mb-2">5. Your Rights and Choices</Text>
            <Text className="text-gray-600 text-sm leading-relaxed mb-2">
              You have the right to access, edit, or delete your user account and profile data at any time. For inquiries, please contact us at <Text className="font-bold text-[#176B87]">privacy@easyfinder.ae</Text>.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
