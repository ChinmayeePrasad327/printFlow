import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSocket } from '../contexts/SocketContext';
import { useTheme } from '../../hooks/useTheme';

export const NotificationBanner: React.FC = () => {
  const { notifications } = useSocket();
  const [latest, setLatest] = useState<any | null>(null);
  const progress = useSharedValue(0);
  const { colors } = useTheme();

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      setLatest(notifications[0]);
      progress.value = withTiming(1, { duration: 300 });
      const t = setTimeout(() => { progress.value = withTiming(0, { duration: 300 }); }, 3500);
      return () => clearTimeout(t);
    }
  }, [notifications]);

  const aStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * -80 }], opacity: progress.value }));

  if (!latest) return null;

  return (
    <Animated.View style={[styles.container, aStyle, { backgroundColor: colors.surface, borderColor: colors.border }] }>
      <View style={{ padding: 12 }}>
        <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{latest.title}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{latest.message || JSON.stringify(latest.meta)}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    borderRadius: 12,
    zIndex: 1000,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  }
});
