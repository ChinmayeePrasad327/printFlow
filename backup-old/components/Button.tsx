import React from 'react';
import { Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { Typography } from '../constants/typography';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export const Button: React.FC<ButtonProps> = ({ title, onPress, style, textStyle, disabled }) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const rStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[rStyle]}>
      <Pressable
        accessibilityRole="button"
        onPressIn={() => (scale.value = withTiming(0.97, { duration: 120 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 120 }))}
        onPress={onPress}
        style={({ pressed }) => [styles.button, { backgroundColor: colors.primary, opacity: disabled ? 0.6 : 1 }, style]}
        disabled={disabled}
      >
        <Text style={[styles.text, { color: '#fff' }, textStyle]}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.uiMedium
  }
});
