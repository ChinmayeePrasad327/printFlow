import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, Easing, runOnJS } from 'react-native-reanimated';

export const AnimatedSplash: React.FC<{ onFinish?: () => void }> = ({ onFinish }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // 2500ms animation
    scale.value = withTiming(1.06, { duration: 1200, easing: Easing.out(Easing.exp) });
    opacity.value = withTiming(1, { duration: 600 });
    const t = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 400 });
      scale.value = withTiming(1, { duration: 300 }, () => {
        if (onFinish) runOnJS(onFinish)();
      });
    }, 1700);
    return () => clearTimeout(t);
  }, []);

  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.logoWrap, aStyle]}>
        {/* Replace with actual SVG logo in assets */}
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  logoWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    width: 120,
    height: 120
  }
});
