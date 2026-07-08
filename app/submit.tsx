import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StatusBar,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import { useCategories } from '../src/hooks/useCategories';
import { fileService } from '../src/services/file.service';
import { apiClient } from '../src/services/api-client';
import { sanitizeSearchQuery } from '../src/utils/inputSanitizer';

export default function SubmitVendorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: categories, isLoading: loadingCategories } = useCategories();

  // Wizard Step State
  const [step, setStep] = useState<number>(1);

  // Form Fields State
  const [name, setName] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string | number>('');
  const [phone, setPhone] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  
  // Step 2 Form Fields State
  const [serviceAreas, setServiceAreas] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Step 3 Image/Logo State
  const [logoUri, setLogoUri] = useState<string | null>(null);

  // Category Dropdown Modal
  const [categoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);

  // Submission loading state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Step validation
    if (step === 1) {
      if (!name.trim()) {
        Alert.alert('Validation Error', 'Please enter the service provider name.');
        return;
      }
      if (!categoryId) {
        Alert.alert('Validation Error', 'Please select a service category.');
        return;
      }
      if (!phone.trim()) {
        Alert.alert('Validation Error', 'Please enter a contact phone number.');
        return;
      }
    } else if (step === 2) {
      if (!serviceAreas.trim()) {
        Alert.alert('Validation Error', 'Please specify at least one service area (e.g. Dubai, Abu Dhabi).');
        return;
      }
      if (!description.trim()) {
        Alert.alert('Validation Error', 'Please describe the services provided.');
        return;
      }
    }
    
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(prev => prev - 1);
  };

  const pickImage = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Needed', 'EasyFinder requires permission to access your photo library to select a logo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setLogoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'An error occurred while picking the image.');
    }
  };

  const handleSubmit = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    try {
      let uploadedLogoId: string | null = null;

      // 1. Upload logo if selected
      if (logoUri) {
        // Simple default mime types
        const filename = logoUri.split('/').pop() || 'logo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : `image/jpeg`;
        
        uploadedLogoId = await fileService.uploadFile(logoUri, filename, fileType);
      }

      // Generate secure/sanitized slug from name
      const generatedSlug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // 2. Submit Vendor POST
      const vendorData = {
        status: 'pending',
        name: name.trim(),
        slug: `${generatedSlug}-${Math.floor(1000 + Math.random() * 9000)}`,
        category: categoryId,
        phone: phone.trim(),
        whatsapp_link: whatsapp.trim() ? (whatsapp.trim().startsWith('http') ? whatsapp.trim() : `https://wa.me/${whatsapp.trim().replace(/[^0-9]/g, '')}`) : '',
        website: website.trim(),
        email: email.trim(),
        service_areas: serviceAreas.trim(),
        description: description.trim(),
        verified: false,
        featured: false,
        logo: uploadedLogoId,
      };

      await apiClient.post('/items/vendors', vendorData);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Submission Received',
        'Thank you! Your service provider listing has been submitted and is currently pending review by our moderation team.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting vendor:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      const errorMessage = error?.response?.data?.errors?.[0]?.message || 'Failed to submit service provider. Please verify your internet connection and try again.';
      Alert.alert('Submission Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories?.find(c => c.id === categoryId);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <StatusBar barStyle="light-content" backgroundColor="#176B87" translucent />
      
      {/* Header */}
      <LinearGradient
        colors={['#176B87', '#64B5F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 12 }}
        className="px-4 pb-4 shadow-md flex-row items-center"
      >
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/10 active:bg-white/30 mr-3"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </Pressable>
        <Text className="text-white font-extrabold text-lg flex-1">
          Submit Service Provider
        </Text>
      </LinearGradient>

      {/* Progress Indicator */}
      <View className="bg-white border-b border-gray-100 py-4 px-6 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center justify-center">
          {/* Step 1 Indicator */}
          <View className="items-center">
            <View className={`w-8 h-8 rounded-full items-center justify-center font-bold ${step >= 1 ? 'bg-[#176B87]' : 'bg-gray-200'}`}>
              {step > 1 ? (
                <MaterialCommunityIcons name="check" size={16} color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-xs">1</Text>
              )}
            </View>
            <Text className={`text-[10px] font-bold mt-1 ${step >= 1 ? 'text-[#176B87]' : 'text-gray-400'}`}>Info</Text>
          </View>

          {/* Bar 1 */}
          <View className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-[#176B87]' : 'bg-gray-200'}`} />

          {/* Step 2 Indicator */}
          <View className="items-center">
            <View className={`w-8 h-8 rounded-full items-center justify-center font-bold ${step >= 2 ? 'bg-[#176B87]' : 'bg-gray-200'}`}>
              {step > 2 ? (
                <MaterialCommunityIcons name="check" size={16} color="#ffffff" />
              ) : (
                <Text className={`font-bold text-xs ${step >= 2 ? 'text-white' : 'text-gray-400'}`}>2</Text>
              )}
            </View>
            <Text className={`text-[10px] font-bold mt-1 ${step >= 2 ? 'text-[#176B87]' : 'text-gray-400'}`}>Details</Text>
          </View>

          {/* Bar 2 */}
          <View className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-[#176B87]' : 'bg-gray-200'}`} />

          {/* Step 3 Indicator */}
          <View className="items-center">
            <View className={`w-8 h-8 rounded-full items-center justify-center font-bold ${step >= 3 ? 'bg-[#176B87]' : 'bg-gray-200'}`}>
              <Text className={`font-bold text-xs ${step >= 3 ? 'text-white' : 'text-gray-400'}`}>3</Text>
            </View>
            <Text className={`text-[10px] font-bold mt-1 ${step >= 3 ? 'text-[#176B87]' : 'text-gray-400'}`}>Review</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: insets.bottom + 40 }} className="flex-1">
        {step === 1 && (
          <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <Text className="text-gray-800 font-extrabold text-base mb-2">Basic Provider Information</Text>

            {/* Provider Name */}
            <View className="space-y-1">
              <Text className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Business Name *</Text>
              <TextInput
                placeholder="e.g. Al Safa Plumbers"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-gray-800 font-semibold text-sm"
              />
            </View>

            {/* Category Dropdown Selection */}
            <View className="space-y-1 mt-4">
              <Text className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Business Category *</Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCategoryModalVisible(true);
                }}
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 flex-row justify-between items-center"
              >
                <Text className={`font-semibold text-sm ${selectedCategory ? 'text-gray-800' : 'text-gray-400'}`}>
                  {selectedCategory ? selectedCategory.name : 'Select business type'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#4B5563" />
              </Pressable>
            </View>

            {/* Phone */}
            <View className="space-y-1 mt-4">
              <Text className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Phone Number *</Text>
              <TextInput
                placeholder="e.g. +971 50 123 4567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-gray-800 font-semibold text-sm"
              />
            </View>

            {/* WhatsApp */}
            <View className="space-y-1 mt-4">
              <Text className="text-gray-500 font-semibold text-xs uppercase tracking-wider">WhatsApp Link or Phone</Text>
              <TextInput
                placeholder="e.g. +971 50 123 4567 or wa.me/..."
                placeholderTextColor="#9CA3AF"
                value={whatsapp}
                onChangeText={setWhatsapp}
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-gray-800 font-semibold text-sm"
              />
            </View>

            {/* Website */}
            <View className="space-y-1 mt-4">
              <Text className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Website Address</Text>
              <TextInput
                placeholder="e.g. https://www.alsafaplumbers.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="url"
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-gray-800 font-semibold text-sm"
              />
            </View>

            {/* Email */}
            <View className="space-y-1 mt-4">
              <Text className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Email Address</Text>
              <TextInput
                placeholder="e.g. info@alsafaplumbers.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-gray-800 font-semibold text-sm"
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <Text className="text-gray-800 font-extrabold text-base mb-2">Location & Services Details</Text>

            {/* Service Areas */}
            <View className="space-y-1">
              <Text className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Service Areas * (comma separated)</Text>
              <TextInput
                placeholder="e.g. Dubai, Sharjah, Ajman"
                placeholderTextColor="#9CA3AF"
                value={serviceAreas}
                onChangeText={setServiceAreas}
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-gray-800 font-semibold text-sm"
              />
              <Text className="text-gray-400 text-[10px] mt-0.5">Please specify emirates or cities where services are active.</Text>
            </View>

            {/* Description */}
            <View className="space-y-1 mt-4">
              <Text className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Description of Services *</Text>
              <TextInput
                placeholder="Provide a comprehensive summary of services offered, response times, pricing estimates, etc."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={6}
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-gray-800 font-semibold text-sm h-36"
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View className="space-y-4">
            {/* Logo upload card */}
            <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm items-center">
              <Text className="text-gray-800 font-extrabold text-base text-center mb-1">Company Logo / Image</Text>
              <Text className="text-gray-400 text-xs text-center mb-5 px-4">
                Add an official brand logo or representative photo to attract customers.
              </Text>

              {logoUri ? (
                <View className="relative mb-4">
                  <Image source={{ uri: logoUri }} className="w-28 h-28 rounded-2xl bg-gray-100 border border-gray-200" />
                  <Pressable
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLogoUri(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 w-7 h-7 rounded-full items-center justify-center border-2 border-white"
                  >
                    <MaterialCommunityIcons name="close" size={14} color="#ffffff" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={pickImage}
                  className="w-28 h-28 bg-sky-50 border border-dashed border-[#176B87]/30 rounded-2xl items-center justify-center mb-5 active:bg-sky-100/50"
                >
                  <MaterialCommunityIcons name="camera-plus" size={32} color="#176B87" />
                  <Text className="text-[#176B87] text-[10px] font-extrabold mt-1">SELECT IMAGE</Text>
                </Pressable>
              )}
            </View>

            {/* Submission Preview Card */}
            <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <Text className="text-gray-800 font-extrabold text-base mb-3">Review Your Submission</Text>

              <View className="space-y-3">
                <View className="flex-row">
                  <Text className="text-gray-400 font-bold text-xs w-24">Business:</Text>
                  <Text className="text-gray-800 font-bold text-xs flex-1">{name}</Text>
                </View>
                <View className="flex-row">
                  <Text className="text-gray-400 font-bold text-xs w-24">Category:</Text>
                  <Text className="text-gray-800 font-bold text-xs flex-1">{selectedCategory?.name}</Text>
                </View>
                <View className="flex-row">
                  <Text className="text-gray-400 font-bold text-xs w-24">Phone:</Text>
                  <Text className="text-gray-800 font-bold text-xs flex-1">{phone}</Text>
                </View>
                {whatsapp ? (
                  <View className="flex-row">
                    <Text className="text-gray-400 font-bold text-xs w-24">WhatsApp:</Text>
                    <Text className="text-gray-800 font-bold text-xs flex-1">{whatsapp}</Text>
                  </View>
                ) : null}
                <View className="flex-row">
                  <Text className="text-gray-400 font-bold text-xs w-24">Service Areas:</Text>
                  <Text className="text-gray-800 font-bold text-xs flex-1">{serviceAreas}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Action Button Row */}
        <View className="flex-row items-center justify-between mt-6 space-x-3">
          {step > 1 ? (
            <Pressable
              onPress={handlePrevStep}
              disabled={isSubmitting}
              className="flex-1 bg-white border border-gray-200 py-3.5 rounded-xl items-center justify-center active:bg-gray-50"
            >
              <Text className="text-gray-700 font-bold text-sm">Back</Text>
            </Pressable>
          ) : null}

          {step < 3 ? (
            <Pressable
              onPress={handleNextStep}
              className="flex-1 bg-[#176B87] py-3.5 rounded-xl items-center justify-center active:opacity-95"
            >
              <Text className="text-white font-extrabold text-sm">Next</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 py-3.5 rounded-xl items-center justify-center active:bg-emerald-700 flex-row"
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="text-white font-extrabold text-sm ml-2">Submitting...</Text>
                </>
              ) : (
                <Text className="text-white font-extrabold text-sm">Submit for Review</Text>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl max-h-[80%] pb-8">
            <View className="px-5 py-4 border-b border-gray-100 flex-row justify-between items-center">
              <Text className="text-gray-900 font-extrabold text-base">Select Business Category</Text>
              <Pressable
                onPress={() => setCategoryModalVisible(false)}
                className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center"
              >
                <MaterialCommunityIcons name="close" size={20} color="#1F2937" />
              </Pressable>
            </View>

            {loadingCategories ? (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator size="small" color="#176B87" />
              </View>
            ) : (
              <ScrollView className="px-4 py-2">
                {categories?.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCategoryId(category.id);
                      setCategoryModalVisible(false);
                    }}
                    className={`flex-row items-center py-4 px-3 rounded-xl mb-1 ${categoryId === category.id ? 'bg-[#EEF5FF]' : 'active:bg-gray-50'}`}
                  >
                    <View className="w-8 h-8 bg-sky-50 rounded-lg items-center justify-center mr-3">
                      <MaterialCommunityIcons
                        name={(category.icon || 'star-outline') as any}
                        size={18}
                        color="#176B87"
                      />
                    </View>
                    <Text className={`font-semibold text-sm flex-1 ${categoryId === category.id ? 'text-[#176B87] font-bold' : 'text-gray-800'}`}>
                      {category.name}
                    </Text>
                    {categoryId === category.id && (
                      <MaterialCommunityIcons name="check-circle" size={20} color="#176B87" />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
