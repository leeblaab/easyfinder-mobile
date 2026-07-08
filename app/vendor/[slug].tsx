import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Linking, ActivityIndicator, StatusBar, Alert, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useVendorBySlug } from '../../src/hooks/useVendorBySlug';
import { useVendorReviews } from '../../src/hooks/useVendorReviews';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { validateAndSanitizeUrl } from '../../src/utils/urlValidator';
import { reportService } from '../../src/services/report.service';

export default function VendorDetailScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { data: vendor, isLoading, isError } = useVendorBySlug(slug as string);

  const { user, isAuthenticated } = useAuthStore();
  const { data: reviews, isLoading: loadingReviews, submitReview, isSubmitting } = useVendorReviews(vendor?.id || '');

  // Review states
  const [writeReviewVisible, setWriteReviewVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Report states
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | number | null>(null);
  const [reportReason, setReportReason] = useState<'Spam' | 'Inappropriate' | 'Fake Review' | 'Harassment' | 'Other'>('Spam');
  const [reportComment, setReportComment] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleReportSubmit = async () => {
    if (!selectedReviewId) return;
    setIsSubmittingReport(true);
    try {
      await reportService.reportReview(selectedReviewId, reportReason, reportComment);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Report Submitted',
        'Thank you for your report. We take content policy violations seriously and our moderation team will investigate this review shortly.',
        [{ text: 'OK', onPress: () => setReportModalVisible(false) }]
      );
    } catch (error) {
      console.error('Error reporting review:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Reporting Failed', 'Could not submit your report. Please check your network and try again.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#176B87" />
        <Text className="text-gray-500 text-sm mt-3 font-medium">Loading service provider...</Text>
      </View>
    );
  }

  if (isError || !vendor) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-4">
        <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text className="text-gray-900 font-bold text-xl mt-4 text-center">Provider Not Found</Text>
        <Text className="text-gray-500 text-sm mt-2 text-center">
          The requested service provider could not be loaded or is unavailable.
        </Text>
        <Pressable
          onPress={handleGoBack}
          className="mt-6 bg-[#176B87] px-6 py-3 rounded-xl active:opacity-90"
        >
          <Text className="text-white font-bold text-sm">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const logoUrl = vendor.logo
    ? (vendor.logo.startsWith('http')
        ? vendor.logo
        : `https://api.easyfinder.ae/assets/${vendor.logo}`)
    : null;

  // Split and parse service areas properly
  const serviceAreas = Array.isArray(vendor.service_areas)
    ? vendor.service_areas
    : (vendor.service_areas ? vendor.service_areas.split(',').map(s => s.trim()) : []);

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (vendor.phone) {
      const telUrl = `tel:${vendor.phone}`;
      if (validateAndSanitizeUrl(telUrl)) {
        Linking.openURL(telUrl).catch((err) =>
          console.error('An error occurred calling:', err)
        );
      } else {
        Alert.alert('Security Notice', 'The phone number format is invalid or insecure.');
      }
    }
  };

  const handleWhatsApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (vendor.whatsapp_link) {
      if (validateAndSanitizeUrl(vendor.whatsapp_link)) {
        Linking.openURL(vendor.whatsapp_link).catch((err) =>
          console.error('An error occurred opening WhatsApp:', err)
        );
      } else {
        Alert.alert('Security Notice', 'The WhatsApp link is invalid or insecure.');
      }
    }
  };

  const handleWebsite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (vendor.website) {
      if (validateAndSanitizeUrl(vendor.website)) {
        Linking.openURL(vendor.website).catch((err) =>
          console.error('An error occurred opening Website:', err)
        );
      } else {
        Alert.alert('Security Notice', 'The website URL is invalid or insecure.');
      }
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#176B87" translucent />
      
      {/* Header Bar */}
      <LinearGradient
        colors={['#176B87', '#64B5F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pb-4 shadow-md"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={handleGoBack}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/10 active:bg-white/30"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          </Pressable>
          <Text className="text-white font-extrabold text-lg ml-4 flex-1" numberOfLines={1}>
            {vendor.name}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} className="flex-1">
        {/* Hero Section */}
        <View className="bg-white px-4 py-8 border-b border-gray-100 items-center relative overflow-hidden">
          {/* Subtle ambient overlay */}
          <LinearGradient
            colors={['rgba(23,107,135,0.06)', 'rgba(100,181,246,0.01)']}
            className="absolute top-0 left-0 right-0 h-40"
          />

          {/* Logo / Fallback */}
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm z-10"
              resizeMode="cover"
            />
          ) : (
            <View className="w-24 h-24 rounded-2xl bg-sky-50 items-center justify-center border border-sky-100 shadow-md z-10">
              <Text className="text-sky-800 text-4xl font-extrabold">
                {vendor.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Category & Verified Status */}
          <View className="flex-row items-center justify-center mt-5 flex-wrap z-10">
            <Text className="text-xs text-gray-500 font-bold tracking-wider uppercase bg-gray-100 px-2.5 py-1 rounded-md">
              {vendor.category?.name || 'Service Provider'}
            </Text>
            {vendor.verified && (
              <View className="ml-2 flex-row items-center bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
                <MaterialCommunityIcons name="check-decagram" size={12} color="#176B87" />
                <Text className="text-[10px] text-[#176B87] font-bold ml-1">Verified</Text>
              </View>
            )}
          </View>

          {/* Name */}
          <Text className="text-gray-900 text-2xl font-extrabold text-center mt-3 px-4 leading-tight z-10">
            {vendor.name}
          </Text>
        </View>

        {/* Contact Action Row */}
        <View className="bg-white px-4 py-4 border-b border-gray-100 flex-row justify-around">
          {/* Call Button */}
          <Pressable
            onPress={handleCall}
            disabled={!vendor.phone}
            className={`items-center flex-1 py-3 px-2 rounded-xl mx-1 border border-blue-100 active:opacity-70 ${
              vendor.phone ? 'bg-blue-50/50' : 'bg-gray-50 border-gray-100 opacity-50'
            }`}
          >
            <MaterialCommunityIcons
              name="phone"
              size={24}
              color={vendor.phone ? '#2563EB' : '#9CA3AF'}
            />
            <Text
              className={`text-xs font-bold mt-1.5 ${
                vendor.phone ? 'text-blue-700' : 'text-gray-400'
              }`}
            >
              {vendor.phone ? 'Call Now' : 'N/A'}
            </Text>
          </Pressable>

          {/* WhatsApp Button */}
          <Pressable
            onPress={handleWhatsApp}
            disabled={!vendor.whatsapp_link}
            className={`items-center flex-1 py-3 px-2 rounded-xl mx-1 border border-emerald-100 active:opacity-70 ${
              vendor.whatsapp_link ? 'bg-emerald-50/50' : 'bg-gray-50 border-gray-100 opacity-50'
            }`}
          >
            <MaterialCommunityIcons
              name="whatsapp"
              size={24}
              color={vendor.whatsapp_link ? '#059669' : '#9CA3AF'}
            />
            <Text
              className={`text-xs font-bold mt-1.5 ${
                vendor.whatsapp_link ? 'text-emerald-700' : 'text-gray-400'
              }`}
            >
              {vendor.whatsapp_link ? 'WhatsApp' : 'N/A'}
            </Text>
          </Pressable>

          {/* Website Button */}
          <Pressable
            onPress={handleWebsite}
            disabled={!vendor.website}
            className={`items-center flex-1 py-3 px-2 rounded-xl mx-1 border border-teal-100 active:opacity-70 ${
              vendor.website ? 'bg-teal-50/50' : 'bg-gray-50 border-gray-100 opacity-50'
            }`}
          >
            <MaterialCommunityIcons
              name="web"
              size={24}
              color={vendor.website ? '#0D9488' : '#9CA3AF'}
            />
            <Text
              className={`text-xs font-bold mt-1.5 ${
                vendor.website ? 'text-teal-700' : 'text-gray-400'
              }`}
            >
              {vendor.website ? 'Website' : 'N/A'}
            </Text>
          </Pressable>
        </View>

        {/* Info Blocks */}
        <View className="p-4">
          {/* About / Description */}
          <View className="bg-white p-4 rounded-2xl border border-gray-100 mb-4 shadow-sm">
            <Text className="text-gray-900 font-extrabold text-base mb-2">About Provider</Text>
            <Text className="text-gray-600 text-sm leading-relaxed">
              {vendor.description ||
                'This provider is dedicated to delivering high-quality, professional services. Reach out directly using the actions above for quotes and bookings.'}
            </Text>
          </View>

          {/* Service Areas */}
          {serviceAreas.length > 0 && (
            <View className="bg-white p-4 rounded-2xl border border-gray-100 mb-4 shadow-sm">
              <Text className="text-gray-900 font-extrabold text-base mb-3">Service Areas</Text>
              <View className="flex-row flex-wrap">
                {serviceAreas.map((area, index) => (
                  <View
                    key={index}
                    className="bg-[#EEF5FF] border border-[#176B87]/10 rounded-lg px-3 py-1.5 mr-2 mb-2"
                  >
                    <Text className="text-[#176B87] text-xs font-bold">{area}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Customer Reviews Section */}
          <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-4">
            <View className="flex-row items-center justify-between w-full mb-4">
              <View>
                <Text className="text-gray-900 font-extrabold text-base">Customer Reviews</Text>
                {reviews && reviews.length > 0 ? (
                  <View className="flex-row items-center mt-1">
                    <Text className="text-gray-900 font-extrabold text-sm mr-1">
                      {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                    </Text>
                    <View className="flex-row mr-2">
                      {[1, 2, 3, 4, 5].map((s) => {
                        const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
                        return (
                          <MaterialCommunityIcons
                            key={s}
                            name={s <= Math.round(avg) ? 'star' : 'star-outline'}
                            size={14}
                            color="#EAB308"
                          />
                        );
                      })}
                    </View>
                    <Text className="text-gray-400 text-xs font-semibold">({reviews.length})</Text>
                  </View>
                ) : (
                  <Text className="text-gray-400 text-xs font-semibold mt-1">No reviews yet</Text>
                )}
              </View>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (!isAuthenticated) {
                    Alert.alert(
                      'Authentication Required',
                      'Please sign in or create an account to leave a review.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Sign In', onPress: () => router.push('/auth/login') }
                      ]
                    );
                    return;
                  }
                  setRating(5);
                  setComment('');
                  setWriteReviewVisible(true);
                }}
                className="bg-[#EEF5FF] px-3.5 py-2 rounded-xl active:bg-[#EEF5FF]/80"
              >
                <Text className="text-[#176B87] font-extrabold text-xs">Write a Review</Text>
              </Pressable>
            </View>

            {loadingReviews ? (
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#176B87" />
              </View>
            ) : reviews && reviews.length > 0 ? (
              <View className="space-y-3 mt-2">
                {reviews.map((review) => (
                  <View key={review.id} className="border-b border-gray-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Text className="text-gray-800 font-bold text-sm">
                          {review.user_created?.first_name || 'EasyFinder User'}
                        </Text>
                        <Pressable
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedReviewId(review.id);
                            setReportReason('Spam');
                            setReportComment('');
                            setReportModalVisible(true);
                          }}
                          className="ml-2.5 p-1 active:opacity-70"
                        >
                          <MaterialCommunityIcons name="flag-outline" size={14} color="#EF4444" />
                        </Pressable>
                      </View>
                      <Text className="text-gray-400 text-[10px] font-semibold">
                        {review.date_created ? new Date(review.date_created).toLocaleDateString() : ''}
                      </Text>
                    </View>
                    <View className="flex-row mt-1 mb-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <MaterialCommunityIcons
                          key={s}
                          name={s <= review.rating ? 'star' : 'star-outline'}
                          size={14}
                          color="#EAB308"
                        />
                      ))}
                    </View>
                    <Text className="text-gray-600 text-xs leading-relaxed">{review.comment}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-gray-50/50 rounded-2xl p-6 w-full items-center border border-gray-100/50">
                <MaterialCommunityIcons name="comment-text-outline" size={32} color="#9CA3AF" />
                <Text className="text-gray-800 font-bold text-sm mt-3">Be the First to Review!</Text>
                <Text className="text-gray-400 text-xs text-center mt-1.5 leading-relaxed px-4">
                  Share your genuine experience with this service provider to help others in the UAE make informed decisions.
                </Text>
              </View>
            )}
          </View>

          {/* Write Review Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={writeReviewVisible}
            onRequestClose={() => setWriteReviewVisible(false)}
          >
            <View className="flex-1 justify-end bg-black/40">
              <View className="bg-white rounded-t-3xl p-6 pb-8">
                <View className="flex-row justify-between items-center border-b border-gray-100 pb-3 mb-5">
                  <Text className="text-gray-900 font-extrabold text-base">Write a Review</Text>
                  <Pressable
                    onPress={() => setWriteReviewVisible(false)}
                    className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center"
                  >
                    <MaterialCommunityIcons name="close" size={20} color="#1F2937" />
                  </Pressable>
                </View>

                {/* Star rating selector */}
                <View className="items-center mb-5">
                  <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-2">Tap stars to rate</Text>
                  <View className="flex-row space-x-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setRating(s);
                        }}
                      >
                        <MaterialCommunityIcons
                          name={s <= rating ? 'star' : 'star-outline'}
                          size={36}
                          color="#EAB308"
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Comment TextInput */}
                <View className="space-y-1 mb-6">
                  <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider">Your Experience</Text>
                  <TextInput
                    placeholder="Describe your experience with this service provider..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    value={comment}
                    onChangeText={setComment}
                    textAlignVertical="top"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-semibold text-sm h-28"
                  />
                </View>

                {/* Submit button */}
                <Pressable
                  onPress={async () => {
                    if (!comment.trim()) {
                      Alert.alert('Validation Error', 'Please write a comment for your review.');
                      return;
                    }
                    try {
                      await submitReview({
                        rating,
                        comment: comment.trim(),
                        vendor: vendor.id,
                        status: 'pending'
                      });
                      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      Alert.alert('Review Submitted', 'Thank you! Your review has been submitted for moderation.');
                      setWriteReviewVisible(false);
                    } catch (e) {
                      console.error(e);
                      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                      Alert.alert('Submission Failed', 'Could not post review. Please try again.');
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full bg-[#176B87] py-3.5 rounded-xl items-center justify-center active:opacity-95"
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white font-extrabold text-sm">Submit Review</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Report Review Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={reportModalVisible}
            onRequestClose={() => setReportModalVisible(false)}
          >
            <View className="flex-1 justify-end bg-black/40">
              <View className="bg-white rounded-t-3xl p-6 pb-8">
                <View className="flex-row justify-between items-center border-b border-gray-100 pb-3 mb-5">
                  <Text className="text-gray-900 font-extrabold text-base">Report Inappropriate Content</Text>
                  <Pressable
                    onPress={() => setReportModalVisible(false)}
                    className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center"
                  >
                    <MaterialCommunityIcons name="close" size={20} color="#1F2937" />
                  </Pressable>
                </View>

                {/* Reason Selection */}
                <View className="mb-5">
                  <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-2.5">Why are you reporting this?</Text>
                  <View className="space-y-2">
                    {(['Spam', 'Inappropriate', 'Fake Review', 'Harassment', 'Other'] as const).map((reason) => (
                      <Pressable
                        key={reason}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setReportReason(reason);
                        }}
                        className={`flex-row items-center justify-between p-3.5 rounded-xl border ${reportReason === reason ? 'border-[#176B87] bg-[#EEF5FF]' : 'border-gray-200 bg-white'}`}
                      >
                        <Text className={`font-semibold text-sm ${reportReason === reason ? 'text-[#176B87]' : 'text-gray-700'}`}>
                          {reason}
                        </Text>
                        <View className={`w-5 h-5 rounded-full border items-center justify-center ${reportReason === reason ? 'border-[#176B87] bg-[#176B87]' : 'border-gray-300'}`}>
                          {reportReason === reason && (
                            <View className="w-2.5 h-2.5 rounded-full bg-white" />
                          )}
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Optional Comments */}
                <View className="space-y-1 mb-6">
                  <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider">Additional details (Optional)</Text>
                  <TextInput
                    placeholder="Provide additional details or context to help us review this content..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    value={reportComment}
                    onChangeText={setReportComment}
                    textAlignVertical="top"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-semibold text-sm h-20"
                  />
                </View>

                {/* Submit Report Button */}
                <Pressable
                  onPress={handleReportSubmit}
                  disabled={isSubmittingReport}
                  className="w-full bg-[#EF4444] py-3.5 rounded-xl items-center justify-center active:opacity-95"
                >
                  {isSubmittingReport ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white font-extrabold text-sm">Submit Report</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </View>
  );
}
