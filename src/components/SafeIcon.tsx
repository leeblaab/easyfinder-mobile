import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SafeIconProps {
  name: string;
  size?: number;
  color?: string;
}

export const SafeIcon: React.FC<SafeIconProps> = ({ name, size = 24, color = '#000' }) => {
  try {
    return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
  } catch (error) {
    // Fallback to empty view if icon fails to load
    console.warn(`Icon ${name} failed to load:`, error);
    return null;
  }
};
