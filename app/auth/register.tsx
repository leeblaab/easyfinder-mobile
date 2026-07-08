import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../src/stores/useAuthStore';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const registerAction = useAuthStore((state) => state.register);

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!firstName.trim() || !email.trim() || !password.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMsg('All fields are required.');
      return;
    }
    if (password.length < 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      await registerAction(email.trim(), password, firstName.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // On success, state is authenticated, navigate to profile
      router.replace('/(tabs)/profile');
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Registration error:', err);
      const serverMessage = err?.response?.data?.errors?.[0]?.message;
      setErrorMsg(serverMessage || 'Registration failed. The email might already be in use or format is invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 24,
        }}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        {/* Navigation back */}
        <Pressable
          onPress={handleBack}
          className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100 active:bg-gray-100 mb-8"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
        </Pressable>

        {/* Header Title */}
        <View className="mb-8">
          <Text className="text-xs text-[#176B87] font-bold tracking-wider uppercase">
            EasyFinder UAE
          </Text>
          <Text className="text-3xl font-extrabold text-gray-900 mt-1">
            Create Account
          </Text>
          <Text className="text-sm text-gray-400 mt-2 leading-relaxed">
            Join EasyFinder to list and recommend trusted home, electrical, mechanical, and creative services in the UAE.
          </Text>
        </View>

        {/* Error Alert Box */}
        {errorMsg && (
          <View className="bg-red-50 border border-red-100 p-4 rounded-xl flex-row items-center mb-6">
            <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" />
            <Text className="text-red-700 font-medium text-xs ml-2.5 flex-1 leading-normal">
              {errorMsg}
            </Text>
          </View>
        )}

        {/* Input Fields */}
        <View className="space-y-4">
          {/* First Name */}
          <View>
            <Text className="text-gray-700 font-bold text-xs mb-2">First Name</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
              <MaterialCommunityIcons name="account-outline" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Enter your first name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                autoCorrect={false}
                value={firstName}
                onChangeText={setFirstName}
                className="flex-1 ml-3 text-gray-800 text-sm font-medium py-0.5"
              />
            </View>
          </View>

          {/* Email */}
          <View className="mt-4">
            <Text className="text-gray-700 font-bold text-xs mb-2">Email Address</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
              <MaterialCommunityIcons name="email-outline" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                className="flex-1 ml-3 text-gray-800 text-sm font-medium py-0.5"
              />
            </View>
          </View>

          {/* Password */}
          <View className="mt-4">
            <Text className="text-gray-700 font-bold text-xs mb-2">Password</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
              <MaterialCommunityIcons name="lock-outline" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Min 6 characters"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                className="flex-1 ml-3 text-gray-800 text-sm font-medium py-0.5"
              />
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowPassword(!showPassword); }} className="p-1">
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9CA3AF"
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleRegister}
          disabled={loading}
          className={`w-full mt-8 py-4 rounded-xl items-center justify-center flex-row shadow-sm ${
            loading ? 'bg-gray-300' : 'bg-[#176B87] active:opacity-95'
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
          ) : (
            <MaterialCommunityIcons name="account-plus-outline" size={18} color="#ffffff" className="mr-2" />
          )}
          <Text className="text-white font-extrabold text-sm ml-2">
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </Pressable>

        {/* Navigation Link to Login */}
        <View className="flex-row justify-center items-center mt-8">
          <Text className="text-gray-400 text-xs font-medium">Already have an account?</Text>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/auth/login'); }} className="ml-1.5 p-1 active:opacity-75">
            <Text className="text-[#176B87] text-xs font-extrabold">Log In</Text>
          </Pressable>
        </View>

        {/* Legal Disclaimer */}
        <View className="mt-10 px-4">
          <Text className="text-center text-[11px] text-gray-400 leading-relaxed font-semibold">
            By continuing, you agree to our{' '}
            <Text
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/legal/terms');
              }}
              className="text-[#176B87] font-extrabold underline"
            >
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/legal/privacy');
              }}
              className="text-[#176B87] font-extrabold underline"
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
