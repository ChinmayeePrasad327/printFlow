import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';

const AnimatedPath: any = Animated.createAnimatedComponent(Path);

export const SuccessCheck: React.FC<{ size?: number; onDone?: () => void }> = ({ size = 120, onDone }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 700 }, (finished) => {
      if (finished && onDone) setTimeout(onDone, 300);
    });
  }, []);

  const pathProps = useAnimatedProps(() => {
    const dash = 1000 - 1000 * progress.value;
    return { strokeDashoffset: dash } as any;
  });

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G>
          <Circle cx="50" cy="50" r="40" stroke="#22C55E" strokeWidth="6" fill="none" opacity={0.08} />
          <Circle cx="50" cy="50" r="40" stroke="#22C55E" strokeWidth="6" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.2)} />
          <AnimatedPath
            d="M30 52 L44 66 L70 36"
            stroke="#22C55E"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1000"
            animatedProps={pathProps}
            fill="none"
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({ wrap: { alignItems: 'center', justifyContent: 'center' } });

export default SuccessCheck;
