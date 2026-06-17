import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';

type CardProps = ViewProps & { children?: React.ReactNode };

export const Card: React.FC<CardProps> = ({ children, style, ...rest }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  }
});

export default Card;
