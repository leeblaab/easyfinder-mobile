import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StatusBar, ScrollView, ActivityIndicator, Alert, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useMySubmissions } from '../../src/hooks/useMySubmissions';
import { useMyReviews } from '../../src/hooks/useMyReviews';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  const { data: mySubmissions, isLoading: loadingSubmissions, refetch: refetchSubmissions } = useMySubmissions();
  const { data: myReviews, isLoading: loadingReviews, refetch: refetchReviews } = useMyReviews();

  // Active dashboard tab state
  const [activeTab, setActiveTab] = useState<'submissions' | 'reviews'>('submissions');

  // Biometric security states
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [isCheckingSecurity, setIsCheckingSecurity] = useState<boolean>(true);

  useEffect(() => {
    checkBiometricPreference();
  }, []);

  const checkBiometricPreference = async (): Promise<void> => {
    try {
      const val = await SecureStore.getItemAsync('biometric_app_lock_enabled');
      const isEnabled = val === 'true';
      setBiometricEnabled(isEnabled);
      
      if (isEnabled) {
        setIsUnlocked(false);
        // Trigger auto authentication on mount
        await triggerBiometricAuth(true);
      } else {
        setIsUnlocked(true);
      }
    } catch (e) {
      console.error('Error checking biometric preference:', e);
      setIsUnlocked(true);
    } finally {
      setIsCheckingSecurity(false);
    }
  };

  const triggerBiometricAuth = async (isInitial: boolean = false): Promise<void> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        if (!isInitial) {
          Alert.alert('Security Notice', 'Biometrics is not configured or supported on this device.');
        }
        setIsUnlocked(true);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity to access the Profile',
        fallbackLabel: 'Use device passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsUnlocked(true);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setIsUnlocked(false);
      }
    } catch (e) {
      console.error('Error in biometric authentication:', e);
      setIsUnlocked(true);
    }
  };

  const toggleBiometricLock = async (): Promise<void> => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert('Not Supported', 'Your device does not support or have biometrics enrolled.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: biometricEnabled ? 'Authenticate to disable App Lock' : 'Authenticate to enable App Lock',
      });

      if (result.success) {
        const newValue = !biometricEnabled;
        await SecureStore.setItemAsync('biometric_app_lock_enabled', newValue ? 'true' : 'false');
        setBiometricEnabled(newValue);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Security Updated',
          newValue ? 'Biometric App Lock has been successfully enabled.' : 'Biometric App Lock has been disabled.'
        );
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (e) {
      console.error('Error toggling biometric lock:', e);
      Alert.alert('Error', 'An error occurred setting up biometric lock.');
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (isLoading || isCheckingSecurity) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#176B87" />
        <Text className="text-gray-500 text-sm mt-3 font-medium">Loading profile...</Text>
      </View>
    );
  }

  if (!isUnlocked) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6" style={{ paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View className="w-20 h-20 bg-sky-50 rounded-full items-center justify-center mb-6 border border-sky-100 shadow-sm">
          <MaterialCommunityIcons name="lock-outline" size={44} color="#176B87" />
        </View>
        <Text className="text-2xl font-extrabold text-gray-900 text-center">
          Profile is Locked
        </Text>
        <Text className="text-gray-400 text-sm text-center mt-2 px-4 leading-relaxed">
          Biometric authentication is enabled for your profile. Please verify your identity to access sensitive account options.
        </Text>
        
        <Pressable
          onPress={() => triggerBiometricAuth(false)}
          className="mt-8 bg-[#176B87] px-8 py-3.5 rounded-xl flex-row items-center justify-center active:opacity-90 shadow-sm"
        >
          <MaterialCommunityIcons name="fingerprint" size={20} color="#ffffff" />
          <Text className="text-white font-extrabold text-sm ml-2">Authenticate Now</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View className="px-4 pt-6 pb-4 bg-white border-b border-gray-100">
        <Text className="text-xs text-[#176B87] font-bold tracking-wider uppercase">
          Your Account
        </Text>
        <Text className="text-2xl font-extrabold text-gray-900 mt-1">
          Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} className="flex-1">
        {!isAuthenticated ? (
          /* Unauthenticated State */
          <View className="px-6 py-12 items-center bg-white border-b border-gray-100 shadow-sm">
            <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-6 border border-[#176B87]/10">
              <MaterialCommunityIcons name="account-circle-outline" size={48} color="#176B87" />
            </View>
            <Text className="text-xl font-extrabold text-gray-900 text-center">
              Sign In to EasyFinder
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-2 px-4 leading-relaxed">
              Sign in to submit new local service providers, save favorites, and receive personalized recommendations.
            </Text>

            <View className="w-full mt-8 space-y-3">
              {/* Login Button */}
              <Pressable
                onPress={() => router.push('/auth/login')}
                className="w-full bg-[#176B87] py-3.5 rounded-xl items-center justify-center active:opacity-95"
              >
                <Text className="text-white font-extrabold text-sm">Sign In</Text>
              </Pressable>

              {/* Create Account Button */}
              <Pressable
                onPress={() => router.push('/auth/register')}
                className="w-full bg-white border border-gray-200 py-3.5 rounded-xl items-center justify-center mt-3 active:bg-gray-50"
              >
                <Text className="text-gray-700 font-bold text-sm">Create Account</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* Authenticated State */
          <>
            {/* User Badge / Avatar */}
            <View className="items-center py-8 bg-white mb-3 border-b border-gray-100 shadow-sm">
              <View className="w-24 h-24 bg-[#EEF5FF] rounded-full items-center justify-center border-4 border-white shadow-sm">
                <Text className="text-[#176B87] text-3xl font-extrabold">
                  {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <Text className="text-xl font-extrabold text-gray-900 mt-4">
                {user?.first_name || 'EasyFinder Member'}
              </Text>
              <Text className="text-sm text-gray-400 mt-1">{user?.email}</Text>
            </View>

            {/* Add Service Provider CTA */}
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center justify-between shadow-sm">
              <View className="flex-1 mr-4">
                <Text className="text-gray-800 font-extrabold text-sm">Have a local service business?</Text>
                <Text className="text-gray-400 text-xs mt-0.5">Submit it to the UAE's trusted directory.</Text>
              </View>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/submit');
                }}
                className="bg-[#176B87] px-4 py-2.5 rounded-xl active:opacity-90"
              >
                <Text className="text-white font-extrabold text-xs">+ Submit Provider</Text>
              </Pressable>
            </View>

            {/* Dashboard Tabs Selector */}
            <View className="bg-white border-y border-gray-100 flex-row px-2 py-2 mb-3">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab('submissions');
                }}
                className={`flex-1 py-2.5 rounded-xl items-center justify-center flex-row ${activeTab === 'submissions' ? 'bg-[#EEF5FF]' : 'active:bg-gray-50'}`}
              >
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={18}
                  color={activeTab === 'submissions' ? '#176B87' : '#6B7280'}
                />
                <Text className={`font-extrabold text-xs ml-1.5 ${activeTab === 'submissions' ? 'text-[#176B87]' : 'text-gray-500'}`}>
                  My Submissions ({mySubmissions?.length || 0})
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab('reviews');
                }}
                className={`flex-1 py-2.5 rounded-xl items-center justify-center flex-row ${activeTab === 'reviews' ? 'bg-[#EEF5FF]' : 'active:bg-gray-50'}`}
              >
                <MaterialCommunityIcons
                  name="comment-text-outline"
                  size={18}
                  color={activeTab === 'reviews' ? '#176B87' : '#6B7280'}
                />
                <Text className={`font-extrabold text-xs ml-1.5 ${activeTab === 'reviews' ? 'text-[#176B87]' : 'text-gray-500'}`}>
                  My Reviews ({myReviews?.length || 0})
                </Text>
              </Pressable>
            </View>

            {/* Dashboard Content */}
            <View className="px-4 mb-3">
              {activeTab === 'submissions' ? (
                /* Submissions List */
                loadingSubmissions ? (
                  <ActivityIndicator size="small" color="#176B87" className="py-6" />
                ) : mySubmissions && mySubmissions.length > 0 ? (
                  <View className="space-y-3">
                    {mySubmissions.map((sub) => (
                      <View key={sub.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-row justify-between items-center mb-2">
                        <View className="flex-1 mr-3">
                          <Text className="text-gray-800 font-bold text-sm">{sub.name}</Text>
                          <Text className="text-gray-400 text-xs mt-0.5">{sub.category?.name || 'Service Provider'}</Text>
                        </View>
                        <View className={`px-2.5 py-1 rounded-full ${sub.status === 'published' ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
                          <Text className={`text-[10px] font-extrabold capitalize ${sub.status === 'published' ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {sub.status || 'pending'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm items-center py-8">
                    <MaterialCommunityIcons name="file-document-outline" size={36} color="#9CA3AF" />
                    <Text className="text-gray-800 font-bold text-sm mt-3">No Submissions Yet</Text>
                    <Text className="text-gray-400 text-xs text-center mt-1 px-4 leading-relaxed">
                      You haven't submitted any service providers yet. Click "+ Submit Provider" to add a local business!
                    </Text>
                  </View>
                )
              ) : (
                /* Reviews List */
                loadingReviews ? (
                  <ActivityIndicator size="small" color="#176B87" className="py-6" />
                ) : myReviews && myReviews.length > 0 ? (
                  <View className="space-y-3">
                    {myReviews.map((rev) => (
                      <View key={rev.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-2">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-gray-800 font-bold text-sm flex-1 mr-2" numberOfLines={1}>
                            {rev.vendor?.name || 'Service Provider'}
                          </Text>
                          <View className={`px-2 py-0.5 rounded-full ${rev.status === 'published' ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
                            <Text className={`text-[9px] font-extrabold capitalize ${rev.status === 'published' ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {rev.status || 'pending'}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row mb-1.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <MaterialCommunityIcons
                              key={s}
                              name={s <= rev.rating ? 'star' : 'star-outline'}
                              size={12}
                              color="#EAB308"
                            />
                          ))}
                        </View>
                        <Text className="text-gray-600 text-xs leading-relaxed" numberOfLines={3}>{rev.comment}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm items-center py-8">
                    <MaterialCommunityIcons name="comment-text-outline" size={36} color="#9CA3AF" />
                    <Text className="text-gray-800 font-bold text-sm mt-3">No Reviews Written</Text>
                    <Text className="text-gray-400 text-xs text-center mt-1 px-4 leading-relaxed">
                      You haven't written any reviews yet. Visit your favorite local service provider's details page to leave feedback!
                    </Text>
                  </View>
                )
              )}
            </View>
          </>
        )}

        {/* Security Settings Section (Available globally for best accessibility) */}
        <View className="px-4 mt-5 mb-2">
          <Text className="text-xs text-gray-400 font-bold tracking-wider uppercase">
            Security Settings
          </Text>
        </View>

        <View className="bg-white border-y border-gray-100 mb-3">
          {/* Biometric Toggle */}
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center flex-1 mr-4">
              <View className="w-8 h-8 bg-sky-50 rounded-lg items-center justify-center mr-3">
                <MaterialCommunityIcons name="fingerprint" size={20} color="#176B87" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-bold text-sm">Biometric App Lock</Text>
                <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={2}>
                  Require FaceID/TouchID to access Profile tab
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={toggleBiometricLock}
              trackColor={{ false: '#E5E7EB', true: '#BFE4E5' }}
              thumbColor={biometricEnabled ? '#176B87' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Legal & Policies Section */}
        <View className="px-4 mt-5 mb-2">
          <Text className="text-xs text-gray-400 font-bold tracking-wider uppercase">
            Legal & Policies
          </Text>
        </View>

        <View className="bg-white border-y border-gray-100 mb-3">
          {/* Terms of Service */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/legal/terms');
            }}
            className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100 active:bg-gray-50"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gray-50 rounded-lg items-center justify-center mr-3">
                <MaterialCommunityIcons name="file-document-outline" size={18} color="#4B5563" />
              </View>
              <Text className="text-gray-800 font-bold text-sm">Terms of Service</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
          </Pressable>

          {/* Privacy Policy */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/legal/privacy');
            }}
            className="flex-row items-center justify-between px-4 py-4 active:bg-gray-50"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gray-50 rounded-lg items-center justify-center mr-3">
                <MaterialCommunityIcons name="shield-lock-outline" size={18} color="#4B5563" />
              </View>
              <Text className="text-gray-800 font-bold text-sm">Privacy Policy</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
          </Pressable>
        </View>

        {isAuthenticated && (
          /* Logout button */
          <View className="px-6 mt-4">
            <Pressable
              onPress={handleLogout}
              className="w-full bg-red-50 border border-red-100 py-3.5 rounded-xl items-center justify-center active:bg-red-100/50"
            >
              <Text className="text-red-600 font-extrabold text-sm">Log Out</Text>
            </Pressable>
          </View>
        )}

        {/* Footer info */}
        <Text className="text-center text-xs text-gray-400 mt-8">Version 1.0.0 (Expo Router)</Text>
      </ScrollView>
    </View>
  );
}
