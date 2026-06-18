import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const AnimatedPressable: any = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<Props> = ({ title, onPress, disabled, style, textStyle }) => {
  const { colors } = useTheme() as any;
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: withTiming(scale.value, { duration: 120 }) }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPressIn={() => { if (!disabled) scale.value = 0.97; }}
      onPressOut={() => { if (!disabled) scale.value = 1; }}
      onPress={() => { if (!disabled && onPress) onPress(); }}
      style={[styles.button, { backgroundColor: disabled ? '#CBD5E1' : colors.primary }, style]}
      animatedStyle={aStyle}
    >
      <Text style={[styles.text, { color: '#fff' }, textStyle]}>{title}</Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 16,
    fontWeight: '600'
  }
});

export default Button;
