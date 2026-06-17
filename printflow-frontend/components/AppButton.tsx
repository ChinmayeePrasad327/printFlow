import React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}) => {
  const { tw, colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  let btnStyle = "rounded-xl py-4 px-6 items-center justify-center flex-row shadow-sm";
  let textStyle = "font-inter-bold text-base";

  if (variant === "primary") {
    // Custom green gradient simulation style
    btnStyle += " bg-emerald-600";
    textStyle += " text-white";
  } else if (variant === "secondary") {
    btnStyle += " bg-white border border-slate-200";
    textStyle += " text-emerald-600";
  } else if (variant === "danger") {
    btnStyle += " bg-red-500";
    textStyle += " text-white";
  } else if (variant === "outline") {
    btnStyle += " bg-transparent border border-border";
    textStyle += " text-primary";
  }

  // Handle dark mode variations for secondary and outline
  const isDark = colors.background === "#020617";
  if (isDark && variant === "secondary") {
    btnStyle = "rounded-xl py-4 px-6 items-center justify-center flex-row shadow-sm bg-slate-800 border border-slate-700";
    textStyle = "font-inter-bold text-base text-emerald-500";
  }

  if (disabled || loading) {
    btnStyle += " opacity-50";
  }

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[tw(btnStyle), animatedStyle, style]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? colors.accent : "#FFFFFF"} size="small" />
      ) : (
        <Text style={tw(textStyle)}>{title}</Text>
      )}
    </AnimatedPressable>
  );
};
