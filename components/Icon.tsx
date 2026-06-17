import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  solid?: boolean;
};

export const Icon: React.FC<IconProps> = ({ name, size = 20, color, solid }) => {
  const { colors } = useTheme();
  return (
    <View accessibilityRole="image">
      <MaterialCommunityIcons name={name as any} size={size} color={color || colors.textPrimary} />
    </View>
  );
};
