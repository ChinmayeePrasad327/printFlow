import React from "react";
import { Pressable, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  noPadding?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  onPress,
  style,
  noPadding = false,
}) => {
  const { tw } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withTiming(0.98, { duration: 150 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withTiming(1, { duration: 150 });
    }
  };

  const cardStyle = `bg-card rounded-2xl border border-border shadow-sm ${noPadding ? "" : "p-5"}`;

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[tw(cardStyle), animatedStyle, style]}
        accessibilityRole="button"
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={[tw(cardStyle), style]}>
      {children}
    </View>
  );
};
