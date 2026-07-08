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

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const loginAction = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginAction(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigate back or to Profile
      router.replace('/(tabs)/profile');
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Login error:', err);
      // Attempt to read readable error message from Directus response
      const serverMessage = err?.response?.data?.errors?.[0]?.message;
      setErrorMsg(serverMessage || 'Invalid email or password. Please try again.');
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
            Welcome Back!
          </Text>
          <Text className="text-sm text-gray-400 mt-2 leading-relaxed">
            Log in to manage your submissions, review local services, and keep track of your favorite providers.
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
          {/* Email */}
          <View>
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
                placeholder="Enter your password"
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
          onPress={handleLogin}
          disabled={loading}
          className={`w-full mt-8 py-4 rounded-xl items-center justify-center flex-row shadow-sm ${
            loading ? 'bg-gray-300' : 'bg-[#176B87] active:opacity-95'
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
          ) : (
            <MaterialCommunityIcons name="login" size={18} color="#ffffff" className="mr-2" />
          )}
          <Text className="text-white font-extrabold text-sm ml-2">
            {loading ? 'Logging In...' : 'Log In'}
          </Text>
        </Pressable>

        {/* Navigation Link to Register */}
        <View className="flex-row justify-center items-center mt-8">
          <Text className="text-gray-400 text-xs font-medium">Don't have an account?</Text>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/auth/register'); }} className="ml-1.5 p-1 active:opacity-75">
            <Text className="text-[#176B87] text-xs font-extrabold">Create Account</Text>
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
