import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export const Card: React.FC<CardProps> = ({ children, style }) => {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    // soft shadow (iOS) and elevation (Android)
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  }
});
