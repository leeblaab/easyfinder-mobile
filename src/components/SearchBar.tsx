import React, { useState, useEffect } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search services, categories, or locations...',
  onClear,
}) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChangeText(debouncedValue);
    }
  }, [debouncedValue, onChangeText, value]);

  const handleClear = () => {
    setDebouncedValue('');
    onChangeText('');
    if (onClear) {
      onClear();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTextChange = (text: string) => {
    setDebouncedValue(text);
    if (text.length > 0 && text.length % 3 === 0) {
      Haptics.selectionAsync();
    }
  };

  return (
    <View className="flex-row items-center bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-200">
      <MaterialCommunityIcons name="magnify" size={20} color="#176B87" />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={debouncedValue}
        onChangeText={handleTextChange}
        className="flex-1 ml-2 text-gray-800 text-sm font-semibold py-1"
        clearButtonMode="never"
      />
      {value.length > 0 && (
        <Pressable
          onPress={handleClear}
          className="p-1 active:opacity-75"
        >
          <MaterialCommunityIcons name="close-circle" size={18} color="#9CA3AF" />
        </Pressable>
      )}
    </View>
  );
};